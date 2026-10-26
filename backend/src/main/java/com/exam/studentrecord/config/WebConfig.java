package com.exam.studentrecord.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Robust CORS configuration supporting both local Vite dev servers
 * and deployed production frontend domains on Render.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials
        config.setAllowCredentials(true);

        // Allow local Vite dev servers
        config.addAllowedOriginPattern("http://localhost:[*]");
        config.addAllowedOriginPattern("http://127.0.0.1:[*]");

        // Allow all deployed Render domains (frontend and backend)
        config.addAllowedOriginPattern("https://*.onrender.com");
        config.addAllowedOriginPattern("http://*.onrender.com");

        // Parse any explicitly configured origins from environment variables
        if (allowedOrigins != null) {
            for (String origin : allowedOrigins.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty() && !trimmed.equals("*")) {
                    config.addAllowedOriginPattern(trimmed);
                    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
                        config.addAllowedOriginPattern("https://" + trimmed);
                        config.addAllowedOriginPattern("http://" + trimmed);
                    }
                }
            }
        }

        // Allow all standard HTTP headers and methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
