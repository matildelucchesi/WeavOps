package org.openapitools.configuration;

import java.util.List;
import org.openapitools.domain.CalendarEventCategoryEntity;
import org.openapitools.repository.CalendarEventCategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.bootstrap.calendar-event-categories.enabled",
        havingValue = "true",
        matchIfMissing = true)
public class CalendarEventCategoryDatabaseInitializer implements CommandLineRunner {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(CalendarEventCategoryDatabaseInitializer.class);

    private static final List<DefaultCalendarEventCategory> DEFAULT_CATEGORIES =
            List.of(
                    new DefaultCalendarEventCategory("Evento generico", "#4f46e5"),
                    new DefaultCalendarEventCategory("Consegna articolo", "#170da9"),
                    new DefaultCalendarEventCategory("Fine prevista articolo", "#3d81f6"),
                    new DefaultCalendarEventCategory("Fine prevista telaio", "#15be80"),
                    new DefaultCalendarEventCategory("Chiusura aziendale", "#dd0000"));

    private final CalendarEventCategoryRepository calendarEventCategoryRepository;

    public CalendarEventCategoryDatabaseInitializer(
            CalendarEventCategoryRepository calendarEventCategoryRepository) {
        this.calendarEventCategoryRepository = calendarEventCategoryRepository;
    }

    @Override
    public void run(String... args) {
        try {
            for (DefaultCalendarEventCategory defaultCategory : DEFAULT_CATEGORIES) {
                upsertDefaultCategory(defaultCategory);
            }
        } catch (DataAccessResourceFailureException exception) {
            LOGGER.warn("MongoDB is not available. Skipping calendar event category bootstrap.");
        }
    }

    private void upsertDefaultCategory(DefaultCalendarEventCategory defaultCategory) {
        CalendarEventCategoryEntity category =
                calendarEventCategoryRepository
                        .findByNameIgnoreCase(defaultCategory.name())
                        .orElseGet(CalendarEventCategoryEntity::new);

        category.setName(defaultCategory.name());
        category.setColor(defaultCategory.color());
        category.setStandard(true);

        calendarEventCategoryRepository.save(category);
    }

    private record DefaultCalendarEventCategory(String name, String color) {
    }
}
