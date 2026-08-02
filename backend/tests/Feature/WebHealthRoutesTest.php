<?php

namespace Tests\Feature;

use Tests\TestCase;

class WebHealthRoutesTest extends TestCase
{
    public function test_root_returns_ok(): void
    {
        $this->get('/')->assertStatus(200);
    }

    public function test_root_returns_json_when_requested(): void
    {
        $this->getJson('/')
            ->assertStatus(200)
            ->assertJsonPath('backend', 'ok')
            ->assertJsonStructure([
                'backend',
                'application' => ['name', 'environment', 'debug', 'api_version', 'laravel_version'],
                'database' => ['status', 'driver'],
                'queue',
                'storage',
                'cache',
                'mail',
            ]);
    }

    public function test_health_aggregate(): void
    {
        $this->getJson('/health')
            ->assertStatus(200)
            ->assertJsonPath('status', 'ok')
            ->assertJsonStructure(['checks' => ['database', 'queue', 'storage', 'cache']]);
    }

    public function test_health_db_endpoint(): void
    {
        $this->getJson('/health/db')->assertStatus(200)->assertJsonStructure(['status', 'driver']);
    }

    public function test_storage_link_check(): void
    {
        $this->getJson('/storage-link-check')
            ->assertStatus(200)
            ->assertJsonStructure(['public_storage_path', 'exists', 'is_symlink']);
    }

    public function test_unknown_web_route_returns_json_404(): void
    {
        $this->getJson('/this-route-should-not-exist-xyz')
            ->assertStatus(404)
            ->assertJson(['message' => 'Not Found']);
    }
}
