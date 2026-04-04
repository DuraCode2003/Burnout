package com.burnouttracker.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for burnout alert events.
 * 
 * Exchange: burnout.alerts.exchange (topic exchange)
 * Queue: burnout.alerts.new (durable, for AI service consumption)
 * Routing Key: burnout.alerts.new
 */
@Configuration
public class RabbitMQConfig {

    public static final String ALERT_EXCHANGE = "burnout.alerts.exchange";
    public static final String ALERT_QUEUE = "burnout.alerts.new";
    public static final String ALERT_ROUTING_KEY = "burnout.alerts.new";

    /**
     * Topic exchange for alert events.
     * Allows multiple queues to subscribe to different alert types.
     */
    @Bean
    public TopicExchange alertExchange() {
        return new TopicExchange(ALERT_EXCHANGE, true, false);
    }

    /**
     * Queue for AI proactive agent to consume alert events.
     * Durable so messages survive broker restarts.
     */
    @Bean
    public Queue alertQueue() {
        return QueueBuilder.durable(ALERT_QUEUE)
            .withArgument("x-message-ttl", 86400000) // 24 hours TTL
            .build();
    }

    /**
     * Bind queue to exchange with routing key.
     */
    @Bean
    public Binding alertBinding(Queue alertQueue, TopicExchange alertExchange) {
        return BindingBuilder.bind(alertQueue).to(alertExchange).with(ALERT_ROUTING_KEY);
    }

    /**
     * JSON message converter for complex event payloads.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate with JSON message converter.
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
