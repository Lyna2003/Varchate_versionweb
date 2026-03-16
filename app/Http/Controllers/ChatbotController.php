<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $message = $request->input('message');
        $context = $request->input('context', 'General');
        $primaryProvider = config('services.chatbot.provider', 'gemini');
        $secondaryProvider = ($primaryProvider === 'gemini') ? 'deepseek' : 'gemini';

        $cacheKey = 'chatbot_' . md5(strtolower(trim($message)) . '_' . $context);

        try {
            $reply = Cache::remember($cacheKey, now()->addDays(7), function () use ($message, $context, $primaryProvider) {
                $providers = [$primaryProvider, 'gemini', 'openai', 'groq', 'deepseek'];
                $providers = array_unique(array_filter($providers));

                foreach ($providers as $provider) {
                    try {
                        $rawReply = $this->executeRotatingCall($provider, $message, $context);
                        return $this->sanitizeImageUrls($rawReply);
                    } catch (\Exception $e) {
                        Log::warning("Provider ({$provider}) failed or exhausted. Trying next. Error: " . $e->getMessage());
                        continue;
                    }
                }

                Log::error("ALL AI systems completely exhausted/unconfigured. Using local fallback.");
                throw new \Exception('ALL_SYSTEMS_EXHAUSTED');
            });

            return response()->json(['reply' => $reply]);

        } catch (\Exception $e) {
            $fallbackReply = $this->getLocalFallbackResponse($message);
            if ($e->getMessage() !== 'ALL_SYSTEMS_EXHAUSTED') {
                Log::error('Chatbot Definitive Failure: ' . $e->getMessage());
            }
            return response()->json(['reply' => $fallbackReply]);
        }
    }

    private function executeRotatingCall($provider, $message, $context)
    {
        $configKey = match($provider) {
            'deepseek' => 'services.chatbot.deepseek_keys',
            'groq' => 'services.chatbot.groq_keys',
            'openai' => 'services.chatbot.openai_keys',
            default => 'services.chatbot.gemini_keys',
        };
        $keys = explode(',', config($configKey, ''));
        $keys = array_filter(array_map('trim', $keys));

        if (empty($keys)) throw new \Exception("No keys configured for {$provider}");

        $errors = [];
        foreach ($keys as $index => $key) {
            try {
                if ($provider === 'deepseek') {
                    return $this->callDeepSeek($key, $message, $context);
                } elseif ($provider === 'groq') {
                    return $this->callGroq($key, $message, $context);
                } elseif ($provider === 'openai') {
                    return $this->callOpenAI($key, $message, $context);
                } else {
                    // Gemini tiene rotación extra de modelos
                    return $this->callGeminiWithModelRotation($key, $message, $context);
                }
            } catch (\Exception $e) {
                $status = $e->getMessage();
                Log::warning("Key #{$index} for {$provider} failed: {$status}");
                $errors[] = $status;
                if (!str_contains($status, 'QUOTA') && !str_contains($status, 'Insufficient Balance')) {
                    // Si no es un error de cuota/saldo, quizás sea algo crítico, pero seguimos intentando
                }
            }
        }

        throw new \Exception("QUOTA_EXHAUSTED_ALL_KEYS: " . implode(' | ', $errors));
    }

    private function callGeminiWithModelRotation($apiKey, $message, $context)
    {
        $models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
        $errors = [];

        foreach ($models as $model) {
            try {
                return $this->callGemini($apiKey, $model, $message, $context);
            } catch (\Exception $e) {
                if ($e->getMessage() === 'QUOTA_EXHAUSTED') {
                    Log::info("Model {$model} exhausted for key. Trying next model.");
                    continue;
                }
                throw $e; // Si es error de API/Auth, no rotamos modelo
            }
        }

        throw new \Exception('QUOTA_EXHAUSTED');
    }

    private function callGemini($apiKey, $model, $message, $context)
    {
        $response = Http::withoutVerifying()->timeout(15)->withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $this->getSystemPrompt($context) . "\nUsuario pregunta: {$message} "]]]
                ]
            ]);

        if ($response->failed()) {
            if (($response->json()['error']['status'] ?? '') === 'RESOURCE_EXHAUSTED' || $response->status() === 429) {
                throw new \Exception('QUOTA_EXHAUSTED');
            }
            throw new \Exception('GEMINI_API_ERROR: ' . ($response->json()['error']['message'] ?? $response->body()));
        }

        return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? throw new \Exception('EMPTY_RESPONSE');
    }

    private function callDeepSeek($apiKey, $message, $context)
    {
        $response = Http::withoutVerifying()->timeout(15)->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$apiKey}",
            ])->post("https://api.deepseek.com/chat/completions", [
                'model' => 'deepseek-chat',
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt($context)],
                    ['role' => 'user', 'content' => $message],
                ],
                'stream' => false
            ]);

        if ($response->failed()) {
            $body = $response->body();
            if ($response->status() === 429 || str_contains($body, 'Insufficient Balance')) {
                throw new \Exception('QUOTA_EXHAUSTED');
            }
            throw new \Exception('DEEPSEEK_API_ERROR: ' . $body);
        }

        return $response->json()['choices'][0]['message']['content'] ?? throw new \Exception('EMPTY_RESPONSE');
    }

    private function callGroq($apiKey, $message, $context)
    {
        $response = Http::withoutVerifying()->timeout(15)->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$apiKey}",
            ])->post("https://api.groq.com/openai/v1/chat/completions", [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt($context)],
                    ['role' => 'user', 'content' => $message],
                ],
            ]);

        if ($response->failed()) {
            if ($response->status() === 429) {
                throw new \Exception('QUOTA_EXHAUSTED');
            }
            throw new \Exception('GROQ_API_ERROR: ' . ($response->json()['error']['message'] ?? $response->body()));
        }

        return $response->json()['choices'][0]['message']['content'] ?? throw new \Exception('EMPTY_RESPONSE');
    }

    private function callOpenAI($apiKey, $message, $context)
    {
        $response = Http::withoutVerifying()->timeout(20)->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$apiKey}",
            ])->post("https://api.openai.com/v1/chat/completions", [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt($context)],
                    ['role' => 'user', 'content' => $message],
                ],
            ]);

        if ($response->failed()) {
            if ($response->status() === 429) {
                throw new \Exception('QUOTA_EXHAUSTED');
            }
            throw new \Exception('OPENAI_API_ERROR: ' . ($response->json()['error']['message'] ?? $response->body()));
        }

        return $response->json()['choices'][0]['message']['content'] ?? throw new \Exception('EMPTY_RESPONSE');
    }

    private function sanitizeImageUrls($text)
    {
        // 1. Primero arreglamos cualquier intento manual de la IA de hacer markdown (por si no usa el tag)
        // Buscamos URLs de pollinations en el texto y las extraemos para sanearlas
        $text = preg_replace_callback('/https?:\/\/pollinations\.ai\/p\/([^\s\?\)\]]+)/i', function ($matches) {
            $rawPrompt = $matches[1];
            $cleanPrompt = preg_replace('/[^a-zA-Z0-9\s-]/', '', urldecode($rawPrompt));
            $finalPrompt = rawurlencode(str_replace(' ', '-', strtolower(trim($cleanPrompt))));
            return "https://pollinations.ai/p/{$finalPrompt}?width=1024&height=1024&nologo=true";
        }, $text);

        // 2. Procesamos el tag oficial [GENERATE_IMAGE: prompt]
        $text = preg_replace_callback('/\[GENERATE_IMAGE:\s*(.*?)\]/i', function ($matches) {
            $prompt = trim($matches[1]);
            if (empty($prompt)) $prompt = "cute cat";
            
            $cleanPrompt = preg_replace('/[^a-zA-Z0-9\s]/', '', $prompt); 
            $finalPrompt = rawurlencode(str_replace(' ', '-', strtolower(trim($cleanPrompt))));
            
            $url = "https://pollinations.ai/p/{$finalPrompt}?width=1024&height=1024&nologo=true&seed=" . mt_rand(1, 9999);
            return "\n![IMAGE]($url)";
        }, $text);

        // 3. Limpiar cualquier basura que haya quedado como bloques de código vacíos
        $text = str_replace(['```markdown', '```'], '', $text);

        return trim($text);
    }

    private function getSystemPrompt($context)
    {
        return "Eres 'Varchate Cat', el asistente oficial de Varchate. Contexto: El usuario está en '{$context}'. INSTRUCCIONES: Sé conciso, amigable y usa un tono gatuno. IMPORTANTE: Si ya saludaste antes o la conversación ya empezó, NO vuelvas a presentarte.
        
        REGLA DE IMÁGENES (MÁXIMA PRIORIDAD):
        Si el usuario te pide un dibujo o imagen:
        1. Responde de forma breve y gatuna.
        2. Al final, escribe EXACTAMENTE: [GENERATE_IMAGE: P]
        (Sustituye 'P' por una descripción visual corta EN INGLÉS).
        No uses markdown, ni URLs, ni bloques de código. Solo el tag.";
    }

    private function getLocalFallbackResponse($message)
    {
        $responses = [
            "¡Miau! Mis cerebros espaciales están descansando un momento, pero aquí estoy. ¿En qué puedo ayudarte? 🐾",
            "¡Ronroneo! Mis conexiones están algo lentas hoy, pero sigo aquí para acompañarte en Varchate. 🐱",
            "¡Miau! Ahora mismo estoy afilando mis garras cerebrales. Vuelve a preguntarme en un ratito y seré más inteligente. ✨",
            "¡Hola! Soy Varchate Cat. Aunque mis neuronas artificiales están durmiendo la siesta, siempre tengo un miau para ti. 🐾",
            "¡Miau! Parece que he hablado mucho hoy. Pero no te preocupes, ¡Varchate Cat nunca te deja solo! 😸"
        ];
        
        $lowerMsg = strtolower($message);
        if (str_contains($lowerMsg, 'hola') || str_contains($lowerMsg, 'buenos')) {
            return "¡Miau! ¡Hola humano! Soy Varchate Cat. ¿Cómo va tu día? 🐾";
        }
        
        return $responses[array_rand($responses)];
    }
}
