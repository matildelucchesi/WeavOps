package org.openapitools.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "destinations")
public class DestinationEntity {
    @Id private String id;
    private String name;
    private String street;
    private String streetNumber;
    private String postalCode;
    private String city;
    private String provinceCode;

    public String getId() {
        return id;
    }

    public void setId(String value) {
        this.id = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String value) {
        this.name = value;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String value) {
        this.street = value;
    }

    public String getStreetNumber() {
        return streetNumber;
    }

    public void setStreetNumber(String value) {
        this.streetNumber = value;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String value) {
        this.postalCode = value;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String value) {
        this.city = value;
    }

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String value) {
        this.provinceCode = value;
    }
}
