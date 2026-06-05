package org.openapitools.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "customers")
public class CustomerEntity {

    @Id
    private String id;

    private String name;

    private List<ReferentEntity> referents = new ArrayList<>();

    private List<ItemEntity> items = new ArrayList<>();

    private String note;

    private String email;

    //getter & setter


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
