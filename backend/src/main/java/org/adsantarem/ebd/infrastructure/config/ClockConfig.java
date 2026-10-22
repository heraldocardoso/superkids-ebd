package org.adsantarem.ebd.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/** "Hoje" e "esta semana" contam no fuso de Lisboa, seja onde for que o servidor corra. */
@Configuration
public class ClockConfig {

    @Bean
    public Clock relogio(@Value("${app.fuso:Europe/Lisbon}") String fuso) {
        return Clock.system(ZoneId.of(fuso));
    }
}
