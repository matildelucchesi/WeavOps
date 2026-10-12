package org.openapitools.configuration;

import com.mongodb.ConnectionString;
import java.io.Console;
import java.util.Arrays;
import org.openapitools.domain.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminProvisioningService {
    private static final String COORDINATION_COLLECTION = "weavops_provisioning";

    private final MongoTemplate mongoTemplate;
    private final PasswordEncoder passwordEncoder;
    private final String mongoUri;

    public AdminProvisioningService(
            MongoTemplate mongoTemplate,
            PasswordEncoder passwordEncoder,
            @Value("${spring.data.mongodb.uri}") String mongoUri) {
        this.mongoTemplate = mongoTemplate;
        this.passwordEncoder = passwordEncoder;
        this.mongoUri = mongoUri;
    }

    public void runInteractive(Console console) {
        if (console == null) {
            throw new IllegalStateException(
                    "Il comando create-admin richiede un terminale interattivo.");
        }

        ConnectionString connection = new ConnectionString(mongoUri);
        console.printf(
                "Database: %s%nDestinazione MongoDB: %s%n",
                mongoTemplate.getDb().getName(), String.join(", ", connection.getHosts()));
        String confirmation = console.readLine("Confermi la creazione del primo utente? (s/N): ");
        if (!"s".equalsIgnoreCase(confirmation == null ? "" : confirmation.strip())) {
            throw new IllegalStateException("Operazione annullata.");
        }

        ensureUsernameIndex();
        ensureCoordinationCollection();

        String username =
                AdminCredentialsValidator.normalizeUsername(console.readLine("Username: "));
        char[] password = console.readPassword("Password: ");
        char[] repeatedPassword = console.readPassword("Conferma password: ");
        try {
            AdminCredentialsValidator.validatePassword(password);
            if (!Arrays.equals(password, repeatedPassword)) {
                throw new IllegalArgumentException("Le password non coincidono.");
            }
            provisionUser(username, password);
            console.printf("Utente %s creato correttamente.%n", username);
        } finally {
            if (password != null) {
                Arrays.fill(password, '\0');
            }
            if (repeatedPassword != null) {
                Arrays.fill(repeatedPassword, '\0');
            }
        }
    }

    private void ensureUsernameIndex() {
        mongoTemplate
                .indexOps(UserEntity.class)
                .ensureIndex(new Index().on("username", Sort.Direction.ASC).unique());
    }

    private void ensureCoordinationCollection() {
        if (mongoTemplate.collectionExists(COORDINATION_COLLECTION)) {
            return;
        }
        try {
            mongoTemplate.createCollection(COORDINATION_COLLECTION);
        } catch (RuntimeException exception) {
            // Another create-admin process may have created it after our existence check.
            if (!mongoTemplate.collectionExists(COORDINATION_COLLECTION)) {
                throw exception;
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void provisionUser(String username, char[] password) {
        String normalizedUsername = AdminCredentialsValidator.normalizeUsername(username);
        AdminCredentialsValidator.validatePassword(password);

        // A shared write inside the transaction serializes concurrent first-user attempts.
        mongoTemplate.upsert(
                Query.query(Criteria.where("_id").is("first-admin")),
                new Update().inc("generation", 1),
                COORDINATION_COLLECTION);

        if (mongoTemplate.count(new Query(), UserEntity.class) != 0) {
            throw new IllegalStateException(
                    "Esistono già utenti. Nessun account è stato modificato.");
        }

        UserEntity user = new UserEntity();
        user.setUsername(normalizedUsername);
        user.setPassword(passwordEncoder.encode(new String(password)));
        try {
            mongoTemplate.insert(user);
        } catch (DuplicateKeyException exception) {
            throw new IllegalStateException(
                    "Username già presente o provisioning concorrente. Riprova.");
        }
    }
}
