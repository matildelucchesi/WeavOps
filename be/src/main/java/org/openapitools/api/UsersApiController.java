package org.openapitools.api;

import jakarta.annotation.Generated;
import jakarta.validation.constraints.*;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.request.NativeWebRequest;

@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-06-01T16:52:32.973382600+02:00[Europe/Rome]",
        comments = "Generator version: 7.22.0")
@Controller
@RequestMapping("${openapi.demo.base-path:}")
public class UsersApiController implements UsersApi {

    private final NativeWebRequest request;

    @Autowired
    public UsersApiController(NativeWebRequest request) {
        this.request = request;
    }

    @Override
    public Optional<NativeWebRequest> getRequest() {
        return Optional.ofNullable(request);
    }
}
