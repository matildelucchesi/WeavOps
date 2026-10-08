package org.openapitools.repository;

import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.model.LoomItemAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoomItemAssignmentRepository extends MongoRepository<LoomItemAssignmentEntity, String> {

    List<LoomItemAssignmentEntity> findByLoomId(String loomId);

    List<LoomItemAssignmentEntity> findByItemId(String itemId);

    List<LoomItemAssignmentEntity> findByLoomIdAndStatus(
            String loomId,
            LoomItemAssignment.StatusEnum status
    );

    Optional<LoomItemAssignmentEntity> findByProcessId(String processId);

    boolean existsByItemIdAndLoomIdAndStatusIn(
            String itemId,
            String loomId,
            List<LoomItemAssignment.StatusEnum> statuses
    );

    List<LoomItemAssignmentEntity> findByItemIdAndLoomIdAndStatusIn(
            String itemId,
            String loomId,
            List<LoomItemAssignment.StatusEnum> statuses
    );

}
