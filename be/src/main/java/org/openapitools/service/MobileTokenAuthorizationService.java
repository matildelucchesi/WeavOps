package org.openapitools.service;

import jakarta.servlet.http.HttpServletRequest;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.function.Supplier;

@Service
public class MobileTokenAuthorizationService {

    private static final String USER_AUTHORITY = "USER";
    private static final String MOBILE_AUTHORITY = "LOOM_MOBILE";

    private final LoomItemAssignmentRepository assignmentRepository;
    private final ItemRepository itemRepository;
    private final ArrangementRepository arrangementRepository;

    public MobileTokenAuthorizationService(
            LoomItemAssignmentRepository assignmentRepository,
            ItemRepository itemRepository,
            ArrangementRepository arrangementRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.itemRepository = itemRepository;
        this.arrangementRepository = arrangementRepository;
    }

    public org.springframework.security.authorization.AuthorizationDecision authorize(
            Supplier<Authentication> authenticationSupplier,
            org.springframework.security.web.access.intercept.RequestAuthorizationContext context
    ) {
        Authentication authentication = authenticationSupplier.get();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return new org.springframework.security.authorization.AuthorizationDecision(false);
        }

        if (hasAuthority(authentication, USER_AUTHORITY)) {
            return new org.springframework.security.authorization.AuthorizationDecision(true);
        }

        if (!hasAuthority(authentication, MOBILE_AUTHORITY)
                || !(authentication.getPrincipal() instanceof TokenService.TokenPayload token)
                || !"loom-mobile".equals(token.purpose())
                || token.loomId() == null || token.loomId().isBlank()) {
            return new org.springframework.security.authorization.AuthorizationDecision(false);
        }

        return new org.springframework.security.authorization.AuthorizationDecision(
                isAllowedMobileRequest(token.loomId(), context.getRequest())
        );
    }

    public boolean isMobileToken(Authentication authentication) {
        return authentication != null
                && hasAuthority(authentication, MOBILE_AUTHORITY)
                && authentication.getPrincipal() instanceof TokenService.TokenPayload token
                && "loom-mobile".equals(token.purpose())
                && token.loomId() != null;
    }

    public boolean canUpdateAssignment(Authentication authentication, String assignmentId,
                                        LoomItemAssignment requested) {
        if (!isMobileToken(authentication)
                || !(authentication.getPrincipal() instanceof TokenService.TokenPayload token)) {
            return false;
        }

        LoomItemAssignmentEntity existing = assignmentRepository.findById(assignmentId).orElse(null);
        if (existing == null || !token.loomId().equals(existing.getLoomId())
                || !Objects.equals(existing.getLoomId(), requested.getLoomId())
                || !Objects.equals(existing.getItemId(), requested.getItemId())
                || !Objects.equals(existing.getProcessId(), requested.getProcessId())
                || requested.getStatus() == null) {
            return false;
        }

        LoomItemAssignment.StatusEnum current = existing.getStatus();
        LoomItemAssignment.StatusEnum target = requested.getStatus();
        return (current == LoomItemAssignment.StatusEnum.QUEUED
                    && target == LoomItemAssignment.StatusEnum.RUNNING)
                || (current == LoomItemAssignment.StatusEnum.RUNNING
                    && (target == LoomItemAssignment.StatusEnum.COMPLETED
                        || target == LoomItemAssignment.StatusEnum.ABANDONED));
    }

    public boolean isAllowedMobileRequest(String loomId, HttpServletRequest request) {
        String[] path = request.getServletPath().replaceFirst("^/api(?=/)", "").split("/");
        String method = request.getMethod();

        if ("GET".equals(method) && path.length == 3 && "looms".equals(path[1])) {
            return loomId.equals(path[2]);
        }
        if ("PUT".equals(method) && path.length == 3 && "looms".equals(path[1])) {
            return loomId.equals(path[2]);
        }
        if ("PUT".equals(method) && path.length == 4 && "looms".equals(path[1])
                && "add-pieces".equals(path[3])) {
            return loomId.equals(path[2]);
        }
        if ("POST".equals(method) && path.length == 4 && "looms".equals(path[1])
                && "knotting".equals(path[3])) {
            return loomId.equals(path[2]);
        }
        if ("GET".equals(method) && path.length == 4 && "loom-item-assignments".equals(path[1])
                && "loom".equals(path[2]) && loomId.equals(path[3])) {
            return true;
        }
        if ("GET".equals(method) && path.length == 5 && "loom-item-assignments".equals(path[1])
                && "loom".equals(path[2]) && loomId.equals(path[3]) && "running".equals(path[4])) {
            return true;
        }
        if ("GET".equals(method) && path.length == 4 && "loom-logs".equals(path[1])
                && "loom".equals(path[2]) && loomId.equals(path[3])) {
            return true;
        }
        if ("GET".equals(method) && path.length == 3 && "items".equals(path[1])) {
            return assignmentRepository.findByLoomId(loomId).stream()
                    .anyMatch(assignment -> path[2].equals(assignment.getItemId()));
        }
        if ("GET".equals(method) && path.length == 3 && "processes".equals(path[1])) {
            return assignmentRepository.findByProcessId(path[2])
                    .filter(assignment -> loomId.equals(assignment.getLoomId()))
                    .isPresent();
        }
        if ("GET".equals(method) && path.length == 3 && "arrangements".equals(path[1])) {
            return assignmentRepository.findByLoomId(loomId).stream()
                    .filter(assignment -> assignment.getItemId() != null)
                    .map(assignment -> itemRepository.findById(assignment.getItemId()).orElse(null))
                    .filter(Objects::nonNull)
                    .anyMatch(item -> path[2].equals(item.getArrangementId())
                            && arrangementRepository.existsById(path[2]));
        }
        if ("PUT".equals(method) && path.length == 3 && "loom-item-assignments".equals(path[1])) {
            return assignmentRepository.findById(path[2])
                    .filter(assignment -> loomId.equals(assignment.getLoomId()))
                    .isPresent();
        }
        return false;
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> authority.equals(grantedAuthority.getAuthority()));
    }
}
