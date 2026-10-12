package org.openapitools.model;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.ItemEntity;

class ItemWeightTest {
    @Test
    void totalIsExactAndRecomputedAfterAnEdit() {
        ItemEntity item = new ItemEntity();
        assertNull(item.getTotalWeight());
        item.setWarpWeight(new BigDecimal("0.1"));
        assertNull(item.getTotalWeight());
        item.setWeftWeight(new BigDecimal("0.2"));
        assertEquals(new BigDecimal("0.3"), item.getTotalWeight());
        item.setWarpWeight(new BigDecimal("5.1"));
        assertEquals(new BigDecimal("5.3"), item.getTotalWeight());
    }
}
