package org.openapitools.configuration;

import org.openapitools.domain.UserEntity;
import org.openapitools.service.TokenService;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableAutoConfiguration
@EntityScan(basePackageClasses = UserEntity.class)
@EnableTransactionManagement
@Import({PasswordConfig.class, MongoTransactionConfig.class, AdminProvisioningService.class, TokenService.class})
public class AdminProvisioningConfiguration {
}
