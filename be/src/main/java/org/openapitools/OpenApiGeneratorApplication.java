package org.openapitools;

import com.fasterxml.jackson.databind.Module;
import org.openapitools.configuration.AdminProvisioningConfiguration;
import org.openapitools.configuration.AdminProvisioningService;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.FullyQualifiedAnnotationBeanNameGenerator;

@SpringBootApplication(nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class)
@ComponentScan(
        basePackages = {
            "org.openapitools",
            "org.openapitools.api",
            "org.openapitools.configuration"
        },
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.REGEX,
                    pattern = "org\\.openapitools\\.api\\..*ApiController"),
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = AdminProvisioningConfiguration.class)
        },
        nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class)
public class OpenApiGeneratorApplication {

    public static void main(String[] args) {
        if (args.length > 0 && "create-admin".equals(args[0])) {
            runCreateAdmin(args);
            return;
        }
        SpringApplication.run(OpenApiGeneratorApplication.class, args);
    }

    private static void runCreateAdmin(String[] args) {
        String[] springArgs = java.util.Arrays.copyOfRange(args, 1, args.length);
        SpringApplication application = new SpringApplication(AdminProvisioningConfiguration.class);
        application.setWebApplicationType(WebApplicationType.NONE);

        try (ConfigurableApplicationContext context = application.run(springArgs)) {
            context.getBean(AdminProvisioningService.class).runInteractive(System.console());
        } catch (Exception exception) {
            System.err.println(
                    "Creazione amministratore non riuscita. Verifica la configurazione e il database.");
            System.exit(1);
        }
    }

    @Bean(name = "org.openapitools.OpenApiGeneratorApplication.jsonNullableModule")
    public Module jsonNullableModule() {
        return new JsonNullableModule();
    }
}
