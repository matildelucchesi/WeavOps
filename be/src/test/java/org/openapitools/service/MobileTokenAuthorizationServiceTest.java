package org.openapitools.service;

import org.junit.jupiter.api.Test;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class MobileTokenAuthorizationServiceTest {

    private final MobileTokenAuthorizationService service = new MobileTokenAuthorizationService(
            mock(LoomItemAssignmentRepository.class),
            mock(ItemRepository.class),
            mock(ArrangementRepository.class)
    );

    @Test
    void knottingPostIsAllowedOnlyForTheLoomBoundToTheMobileToken() {
        MockHttpServletRequest matchingRequest = knottingRequest("loom-1");
        MockHttpServletRequest otherLoomRequest = knottingRequest("loom-2");

        assertThat(service.isAllowedMobileRequest("loom-1", matchingRequest)).isTrue();
        assertThat(service.isAllowedMobileRequest("loom-1", otherLoomRequest)).isFalse();
    }

    @Test
    void mobileTokenCannotUsePostMatcherForOtherOperations() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/looms/loom-1/mobile-access-token");
        request.setServletPath("/api/looms/loom-1/mobile-access-token");

        assertThat(service.isAllowedMobileRequest("loom-1", request)).isFalse();
    }

    private MockHttpServletRequest knottingRequest(String loomId) {
        String servletPath = "/api/looms/" + loomId + "/knotting";
        MockHttpServletRequest request = new MockHttpServletRequest("POST", servletPath);
        request.setServletPath(servletPath);
        return request;
    }
}
