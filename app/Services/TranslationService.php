<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TranslationService
{
    /**
     * Translate text from one language to another using Google Translate API.
     * 
     * @param string $text The text to translate
     * @param string $sourceLanguage The source language code (e.g., 'es')
     * @param string $targetLanguage The target language code (e.g., 'en')
     * @return string|null The translated text or null if translation failed
     */
    public function translate($text, $sourceLanguage = 'es', $targetLanguage = 'en')
    {
        // If text is empty, return empty string
        if (empty($text)) {
            return '';
        }
        
        // Create a cache key based on the text and languages
        $cacheKey = 'translation_' . md5($text . $sourceLanguage . $targetLanguage);
        
        // Check if we have a cached translation
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }
        
        try {
            // Try Google Translate API first (using free method)
            $translatedText = $this->googleTranslate($text, $sourceLanguage, $targetLanguage);
            
            if (!empty($translatedText)) {
                // Cache the result for future use (1 day)
                Cache::put($cacheKey, $translatedText, now()->addDay());
                
                // Log successful translation
                Log::info('Google translation successful', [
                    'original' => $text,
                    'translated' => $translatedText
                ]);
                
                return $translatedText;
            }
            
            // If Google Translate fails, try LibreTranslate as backup
            $response = Http::post('https://libretranslate.com/translate', [
                'q' => $text,
                'source' => $sourceLanguage,
                'target' => $targetLanguage,
                'format' => 'text',
            ]);
            
            if ($response->successful()) {
                $translatedText = $response->json('translatedText');
                
                // Cache the result for future use (1 day)
                Cache::put($cacheKey, $translatedText, now()->addDay());
                
                return $translatedText;
            }
            
            // Fallback to a simple translation for common Spanish words
            if ($sourceLanguage === 'es' && $targetLanguage === 'en') {
                $translatedText = $this->simpleSpanishToEnglishTranslation($text);
                Cache::put($cacheKey, $translatedText, now()->addDay());
                return $translatedText;
            }
            
            Log::error('Translation API error', [
                'text' => $text
            ]);
            
            // Return original text if translation failed
            return $text;
        } catch (\Exception $e) {
            Log::error('Translation service exception', [
                'message' => $e->getMessage(),
                'text' => $text
            ]);
            
            // Return original text if exception occurred
            return $text;
        }
    }
    
    /**
     * Use Google Translate API to translate text.
     * This uses a free method without requiring API keys.
     * 
     * @param string $text The text to translate
     * @param string $sourceLanguage The source language code
     * @param string $targetLanguage The target language code
     * @return string The translated text or empty string if failed
     */
    private function googleTranslate($text, $sourceLanguage = 'es', $targetLanguage = 'en')
    {
        try {
            // Use Google Translate API (free method)
            $url = 'https://translate.googleapis.com/translate_a/single';
            
            $response = Http::get($url, [
                'client' => 'gtx',
                'sl' => $sourceLanguage,
                'tl' => $targetLanguage,
                'dt' => 't',
                'q' => $text
            ]);
            
            if ($response->successful()) {
                $result = $response->json();
                
                // Extract translated text from the response
                if (isset($result[0]) && is_array($result[0])) {
                    $translatedText = '';
                    foreach ($result[0] as $part) {
                        if (isset($part[0])) {
                            $translatedText .= $part[0];
                        }
                    }
                    
                    return $translatedText;
                }
            }
            
            return '';
        } catch (\Exception $e) {
            Log::error('Google Translate API error', [
                'message' => $e->getMessage(),
                'text' => $text
            ]);
            
            return '';
        }
    }
    
    /**
     * A very simple Spanish to English translation for common maintenance request words.
     * This is a fallback method when both Google Translate and LibreTranslate APIs fail.
     * 
     * @param string $text The Spanish text
     * @return string The translated English text
     */
    private function simpleSpanishToEnglishTranslation($text)
    {
        $spanishToEnglish = [
            // Common greetings and phrases
            'hola' => 'hello',
            'este' => 'this',
            'es' => 'is',
            'hola este es' => 'hello this is',
            'gracias' => 'thank you',
            'por favor' => 'please',
            'necesito' => 'I need',
            'tengo' => 'I have',
            'hay' => 'there is',
            'no hay' => 'there is no',
            'problemas con' => 'problems with',
            'en mi' => 'in my',
            
            // Maintenance related words
            'agua' => 'water',
            'baño' => 'bathroom',
            'cocina' => 'kitchen',
            'luz' => 'light',
            'electricidad' => 'electricity',
            'calefacción' => 'heating',
            'aire acondicionado' => 'air conditioning',
            'ventana' => 'window',
            'puerta' => 'door',
            'pared' => 'wall',
            'techo' => 'ceiling',
            'piso' => 'floor',
            'fuga' => 'leak',
            'goteo' => 'drip',
            'roto' => 'broken',
            'dañado' => 'damaged',
            'no funciona' => 'not working',
            'necesita reparación' => 'needs repair',
            'urgente' => 'urgent',
            'emergencia' => 'emergency',
            'problema' => 'problem',
            'solicitud' => 'request',
            'mantenimiento' => 'maintenance',
            'reparación' => 'repair',
            'ayuda' => 'help',
            'arreglar' => 'fix',
            'cambiar' => 'change',
            'reemplazar' => 'replace',
            'revisar' => 'check',
            'instalar' => 'install',
            'limpiar' => 'clean',
            'pintar' => 'paint',
            
            // Time related
            'hoy' => 'today',
            'mañana' => 'tomorrow',
            'tarde' => 'afternoon',
            'noche' => 'night',
            'semana' => 'week',
            'mes' => 'month',
            'día' => 'day',
            'hora' => 'hour',
            
            // Common adjectives
            'caliente' => 'hot',
            'frío' => 'cold',
            'grande' => 'big',
            'pequeño' => 'small',
            'nuevo' => 'new',
            'viejo' => 'old',
            'bueno' => 'good',
            'malo' => 'bad',
            'rápido' => 'fast',
            'lento' => 'slow',
        ];
        
        // First try to translate the entire text if it's a common phrase
        if (isset($spanishToEnglish[strtolower($text)])) {
            return $spanishToEnglish[strtolower($text)];
        }
        
        // Then try to translate individual words and phrases
        foreach ($spanishToEnglish as $spanish => $english) {
            $text = str_ireplace($spanish, $english, $text);
        }
        
        return $text;
    }
} 