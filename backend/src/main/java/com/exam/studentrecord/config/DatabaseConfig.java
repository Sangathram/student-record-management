package com.exam.studentrecord.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Custom DataSource configuration that automatically converts cloud database URIs
 * (such as Render's postgres://user:password@host:port/database)
 * into standard JDBC format (jdbc:postgresql://host:port/database).
 */
@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(url);
                String userInfo = uri.getUserInfo();
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                properties.setUrl(jdbcUrl);

                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    properties.setUsername(parts[0]);
                    if (parts.length > 1) {
                        properties.setPassword(parts[1]);
                    }
                }
                properties.setDriverClassName("org.postgresql.Driver");
            } catch (Exception e) {
                System.err.println("Notice: Could not parse database URI as postgres: " + e.getMessage());
            }
        }
        return properties.initializeDataSourceBuilder().build();
    }
}
