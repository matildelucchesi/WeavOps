package org.openapitools.domain;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "customers")
public class CustomerEntity {

    @Id private String id;

    private String name;

    private List<ReferentEntity> referents = new ArrayList<>();

    private List<ItemEntity> items = new ArrayList<>();

    private String note;

    private String email;

    private String vatNumber;
    private String country;

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    private List<String> destinationIds = new ArrayList<>();

    public String getVatNumber() {
        return vatNumber;
    }

    public void setVatNumber(String value) {
        this.vatNumber = value;
    }

    public List<String> getDestinationIds() {
        return destinationIds;
    }

    public void setDestinationIds(List<String> value) {
        this.destinationIds = value;
    }

    private String street;

    public String getStreet() {
        return street;
    }

    public void setStreet(String value) {
        this.street = value;
    }

    private String streetNumber;

    public String getStreetNumber() {
        return streetNumber;
    }

    public void setStreetNumber(String value) {
        this.streetNumber = value;
    }

    private String postalCode;

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String value) {
        this.postalCode = value;
    }

    private String city;

    public String getCity() {
        return city;
    }

    public void setCity(String value) {
        this.city = value;
    }

    private String provinceCode;

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String value) {
        this.provinceCode = value;
    }

    // getter & setter

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ReferentEntity> getReferents() {
        return referents;
    }

    public void setReferents(List<ReferentEntity> referents) {
        this.referents = referents;
    }

    public List<ItemEntity> getItems() {
        return items;
    }

    public void setItems(List<ItemEntity> items) {
        this.items = items;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
