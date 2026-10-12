package org.openapitools.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "services")
public class ServiceEntity {
    @Id private String id;
    private String code;
    private String name;
    private String bandCriterion;

    public ServiceEntity() {
    }

    public ServiceEntity(String code, String name, String bandCriterion) {
        this.code = code;
        this.name = name;
        this.bandCriterion = bandCriterion;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBandCriterion() {
        return bandCriterion;
    }

    public void setBandCriterion(String bandCriterion) {
        this.bandCriterion = bandCriterion;
    }
}
