package org.openapitools.controller;

import org.openapitools.api.LoomsApi;
import org.openapitools.constants.LoomLogEvent;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomLogEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.DeleteMultiLooms200Response;
import org.openapitools.model.Loom;
import org.openapitools.service.LoomService;
import org.openapitools.service.LoomLogService;
import org.openapitools.service.MobileTokenAuthorizationService;
import org.openapitools.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
public class LoomController implements LoomsApi {

    private static final String DUPLICATE_SERIAL_NUMBER_MESSAGE = "Telaio con numero seriale già esistente";

    private final LoomService service;
    private final LoomMapper mapper;
    private final LoomLogService loomLogService;
    private final TokenService tokenService;
    private final MobileTokenAuthorizationService mobileTokenAuthorizationService;

    public LoomController(
            LoomService service,
            LoomMapper mapper,
            LoomLogService loomLogService,
            TokenService tokenService,
            MobileTokenAuthorizationService mobileTokenAuthorizationService
    ) {
        this.service = service;
        this.mapper = mapper;
        this.loomLogService = loomLogService;
        this.tokenService = tokenService;
        this.mobileTokenAuthorizationService = mobileTokenAuthorizationService;
    }

    @Override
    public ResponseEntity<List<Loom>> getLooms() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Loom> getLoomById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    @SuppressWarnings("unchecked")
    public ResponseEntity<Loom> createLoom(@Valid @RequestBody Loom loom) {
        if(service.findBySerialNumber(loom.getSerialNumber()).isPresent()){
            return (ResponseEntity<Loom>) (ResponseEntity<?>) ResponseEntity.badRequest()
                    .body(Map.of("message", DUPLICATE_SERIAL_NUMBER_MESSAGE));
        }else {
            LoomEntity savedLoom = service.save(mapper.toEntity(loom));
            LoomLogEntity loomLog = new LoomLogEntity();
            loomLog.setKey(LoomLogEvent.LOOM_CREATED.name());
            loomLog.setLoomId(savedLoom.getId());
            loomLog.setLoomCode(savedLoom.getSerialNumber());
            loomLogService.save(loomLog);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(mapper.toDto(savedLoom));
        }
    }

    @Override
    public ResponseEntity<Loom> updateLoom(@PathVariable("id") String id, @Valid @RequestBody Loom loom) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (mobileTokenAuthorizationService.isMobileToken(authentication)) {
            if (loom.getStatus() == null) {
                return ResponseEntity.badRequest().build();
            }

            return service.updateStatus(id, loom.getStatus())
                    .map(mapper::toDto)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

        return service.update(id, mapper.toEntity(loom))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteLoom(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @Override
    public ResponseEntity<DeleteMultiLooms200Response> deleteMultiLooms(
            @Valid @RequestBody List<String> requestBody
    ) {
        int deletedCount = service.deleteByIds(requestBody);

        return ResponseEntity.ok(new DeleteMultiLooms200Response().deletedCount(deletedCount));
    }

    @Override
    public ResponseEntity<Loom> addPieces(
            @PathVariable("id") String id,
            @RequestParam(value = "pieces", required = true) Integer pieces
    ) {
        if (id == null || id.isBlank() || pieces == null || pieces <= 0) {
            return ResponseEntity.badRequest().build();
        }

        return service.addPieces(id, pieces)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/looms/{id}/mobile-access-token")
    public ResponseEntity<MobileAccessTokenResponse> createMobileAccessToken(@PathVariable("id") String id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new MobileAccessTokenResponse(tokenService.generateMobileToken(id)));
    }

    public record MobileAccessTokenResponse(String token) {
    }
}
