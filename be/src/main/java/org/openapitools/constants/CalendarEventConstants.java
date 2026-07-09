package org.openapitools.constants;


import org.openapitools.model.CalendarEvent;

import java.util.Map;

public final class CalendarEventConstants {

    private CalendarEventConstants() {}

    public static final String DELIVERY_DATE = "DELIVERY_DATE";
    public static final String PRODUCTION_START = "PRODUCTION_START";
    public static final String PRODUCTION_END = "PRODUCTION_END";
    public static final String LOOM_PRODUCTION_END = "LOOM_PRODUCTION_END";
    public static final String EXPECTED_END_DATE = "EXPECTED_END_DATE";

    public static final Map<String, String> EVENT_DESCRIPTIONS = Map.of(
            DELIVERY_DATE, "Consegna articolo ",
            PRODUCTION_START, "Avvio produzione ",
            PRODUCTION_END, "Fine produzione prevista per ",
            EXPECTED_END_DATE, "Completamento previsto per articolo ",
            LOOM_PRODUCTION_END, "Fine produzione prevista per telaio "
    );

    public static final Map<String, CalendarEvent.ImportanceEnum> EVENT_IMPORTANCE = Map.of(
            DELIVERY_DATE, CalendarEvent.ImportanceEnum.HIGH,
            PRODUCTION_START, CalendarEvent.ImportanceEnum.MEDIUM,
            PRODUCTION_END, CalendarEvent.ImportanceEnum.HIGH,
            LOOM_PRODUCTION_END, CalendarEvent.ImportanceEnum.MEDIUM,
            EXPECTED_END_DATE, CalendarEvent.ImportanceEnum.HIGH
    );
}
