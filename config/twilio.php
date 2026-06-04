<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Twilio Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for Twilio services including
    | WhatsApp messaging and Content API for template management.
    |
    */

    'sid' => env('TWILIO_SID', ''),
    'auth_token' => env('TWILIO_AUTH_TOKEN', ''),
    'whatsapp_from' => env('TWILIO_WHATSAPP_FROM', ''),
    'content_api_base' => 'https://content.twilio.com/v1',
    'webhook_url' => env('TWILIO_CONTENT_API_WEBHOOK_URL', ''),
];