package org.openapitools.domain;

import org.openapitools.model.LoomItemAssignment;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "loom_item_assignments")
public class LoomItemAssignmentEntity {
    @Id
    private String id;

    private String loomId;
    private String itemId;
    private String processId;
    private LoomItemAssignment.StatusEnum status;

    //getter & setter
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
