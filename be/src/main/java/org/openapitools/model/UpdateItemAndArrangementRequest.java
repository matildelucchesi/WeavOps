package org.openapitools.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class UpdateItemAndArrangementRequest {
    @NotNull
    @Valid
    private Item item;

    @NotNull
    @Valid
    private Arrangement arrangement;

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public Arrangement getArrangement() {
        return arrangement;
    }

    public void setArrangement(Arrangement arrangement) {
        this.arrangement = arrangement;
    }
}
