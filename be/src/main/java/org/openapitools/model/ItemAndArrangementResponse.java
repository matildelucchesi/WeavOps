package org.openapitools.model;

public class ItemAndArrangementResponse {
    private final Item item;
    private final Arrangement arrangement;

    public ItemAndArrangementResponse(Item item, Arrangement arrangement) {
        this.item = item;
        this.arrangement = arrangement;
    }

    public Item getItem() {
        return item;
    }

    public Arrangement getArrangement() {
        return arrangement;
    }
}
