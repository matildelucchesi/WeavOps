package org.openapitools.domain;

import org.openapitools.model.LoomItemAssignment;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "loom_item_assignments")
public class LoomItemAssignmentEntity {
    @Id private String id;

    private String loomId;
    private String itemId;
    private String processId;
    private LoomItemAssignment.StatusEnum status;

    @org.springframework.data.annotation.Transient private String fabricCode;
    @org.springframework.data.annotation.Transient private String fabricCertificationId;

    public String getFabricCode() {
        return fabricCode;
    }

    public void setFabricCode(String code) {
        this.fabricCode = code;
    }

    public String getFabricCertificationId() {
        return fabricCertificationId;
    }

    public void setFabricCertificationId(String certificationId) {
        this.fabricCertificationId = certificationId;
    }

    // getter & setter
    public String getProcessId() {
        return processId;
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }

    public LoomItemAssignment.StatusEnum getStatus() {
        return status;
    }

    public void setStatus(LoomItemAssignment.StatusEnum status) {
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getLoomId() {
        return loomId;
    }

    public void setLoomId(String loomId) {
        this.loomId = loomId;
    }
}
