package org.openapitools.constants;


import org.openapitools.model.CalendarEvent;

import java.util.Map;

public final class CalendarEventConstants {

    private CalendarEventConstants() {}

    public static final String DELIVERY_DATE = "DELIVERY_DATE";
    public static final String PRODUCTION_START = "PRODUCTION_START";
    public static final String ITEM_EXPECTED_END = "ITEM_EXPECTED_END";
    public static final String LOOM_EXPECTED_END = "LOOM_EXPECTED_END";
    public static final String CLOSURE  = "CLOSURE";

    public static final Map<String, String> EVENT_DESCRIPTIONS = Map.of(
            DELIVERY_DATE, "Consegna ",
            PRODUCTION_START, "Avvio produzione per",
            ITEM_EXPECTED_END, "Fine prevista per ",
            LOOM_EXPECTED_END, "Fine prevista per telaio ",
            CLOSURE, "Chiusura aziendale"
    );

    public static final Map<String, CalendarEvent.TypeEnum> EVENT_TYPE = Map.of(
            DELIVERY_DATE, CalendarEvent.TypeEnum.DELIVERY,
            PRODUCTION_START, CalendarEvent.TypeEnum.GENERIC,
            ITEM_EXPECTED_END, CalendarEvent.TypeEnum.ITEM_FORECAST,
            LOOM_EXPECTED_END, CalendarEvent.TypeEnum.LOOM_FORECAST,
            CLOSURE, CalendarEvent.TypeEnum.CLOSURE
    );
}
