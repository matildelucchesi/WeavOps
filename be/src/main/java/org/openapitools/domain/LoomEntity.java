package org.openapitools.domain;

import org.openapitools.model.Loom;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "looms")
public class LoomEntity {

    @Id
    private String id;

    private String serialNumber;

    private Loom.StatusEnum status;
    private boolean isAssigned;

    //getter & setter

    public boolean isAssigned() {
        return isAssigned;
    }

    public void setAssigned(boolean assigned) {
        isAssigned = assigned;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Loom.StatusEnum getStatus() {
        return status;
    }

    public void setStatus(Loom.StatusEnum status) {
        this.status = status;
    }
}
