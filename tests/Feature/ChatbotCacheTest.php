<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ChatbotCacheTest extends TestCase
{
    /**
     * Test that chatbot responses are cached.
     *
     * @return void
     */
    public function test_chatbot_rotates_through_multiple_keys()
    {
        Cache::flush();
        config(['services.chatbot.gemini_keys' => 'key1,key2']);
        config(['services.chatbot.provider' => 'gemini']);

        // Simulamos: Key 1 falla para los 3 modelos, Key 2 funciona al primero
        $responses = [
            Http::response(['error' => ['status' => 'RESOURCE_EXHAUSTED']], 429), // Key 1, Flash
            Http::response(['error' => ['status' => 'RESOURCE_EXHAUSTED']], 429), // Key 1, Flash-8B
            Http::response(['error' => ['status' => 'RESOURCE_EXHAUSTED']], 429), // Key 1, Pro
            Http::response(['candidates' => [['content' => ['parts' => [['text' => 'Respuesta Key 2']]]]]], 200), // Key 2, Flash
        ];

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::sequence($responses)
        ]);

        $response = $this->postJson('/api/chatbot/chat', [
            'message' => 'Test Rotation ' . uniqid(),
            'context' => 'General',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('reply', 'Respuesta Key 2');
    }

    public function test_chatbot_rotates_models_if_quota_exhausted()
    {
        Cache::flush();
        config(['services.chatbot.gemini_keys' => 'single_key']);
        config(['services.chatbot.provider' => 'gemini']);

        // Model 1 (flash) fails, Model 2 (flash-8b) works
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::sequence([
                Http::response(['error' => ['status' => 'RESOURCE_EXHAUSTED']], 429), // Flash fails
                Http::response(['candidates' => [['content' => ['parts' => [['text' => 'Respuesta Flash-8B']]]]]], 200), // Flash-8B works
            ])
        ]);

        $response = $this->postJson('/api/chatbot/chat', [
            'message' => 'Test Model Rotation ' . uniqid(),
            'context' => 'General',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('reply', 'Respuesta Flash-8B');
    }
}
