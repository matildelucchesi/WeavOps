package org.openapitools.configuration;

import org.openapitools.domain.UserEntity;
import org.openapitools.repository.UserRepository;
import org.openapitools.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.bootstrap.admin.enabled", havingValue = "true", matchIfMissing = true)
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseInitializer.class);

    private static final String DEFAULT_ADMIN_USERNAME = "admin";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin";

    private final UserRepository userRepository;
    private final UserService userService;

    public DatabaseInitializer(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        try {
            if (userRepository.findByUsername(DEFAULT_ADMIN_USERNAME).isPresent()) {
                return;
            }

            UserEntity admin = new UserEntity();
            admin.setUsername(DEFAULT_ADMIN_USERNAME);
            admin.setPassword(DEFAULT_ADMIN_PASSWORD);
            admin.setFirstName("Admin");
            admin.setLastName("WeavOps");
            admin.setEmail("admin@weavops.local");

            userService.save(admin);
        } catch (DataAccessResourceFailureException exception) {
            LOGGER.warn("MongoDB is not available. Skipping admin bootstrap user creation.");
        }
    }
}
