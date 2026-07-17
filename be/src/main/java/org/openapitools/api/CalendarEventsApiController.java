package org.openapitools.api;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.request.NativeWebRequest;

import java.util.Optional;
import jakarta.annotation.Generated;

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-09T16:50:26.081554300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
@Controller
@RequestMapping("${openapi.demo.base-path:}")
public class CalendarEventsApiController implements CalendarEventsApi {

    private final NativeWebRequest request;

    @Autowired
    public CalendarEventsApiController(NativeWebRequest request) {
        this.request = request;
    }

    @Override
    public Optional<NativeWebRequest> getRequest() {
        return Optional.ofNullable(request);
    }

}
