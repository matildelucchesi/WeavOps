package org.openapitools.controller;

import java.util.List;
import org.openapitools.model.Rate;
import org.openapitools.model.Service;
import org.openapitools.repository.ServiceRepository;
import org.openapitools.service.RateService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class RateController {
    private final RateService rates;
    private final ServiceRepository services;

    public RateController(RateService rates, ServiceRepository services) {
        this.rates = rates;
        this.services = services;
    }

    @GetMapping("/services")
    public List<Service> getServices() {
        return services.findAll().stream()
                .map(
                        entity ->
                                new Service(
                                        entity.getId(),
                                        entity.getCode(),
                                        entity.getName(),
                                        entity.getBandCriterion()))
                .toList();
    }

    @GetMapping("/rates")
    public List<Rate> getRates() {
        return rates.findAll();
    }

    @PostMapping("/rates")
    @ResponseStatus(HttpStatus.CREATED)
    public Rate createRate(@RequestBody Rate rate) {
        return rates.save(null, rate);
    }

    @PutMapping("/rates/{id}")
    public Rate updateRate(@PathVariable String id, @RequestBody Rate rate) {
        return rates.save(id, rate);
    }

    @DeleteMapping("/rates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRate(@PathVariable String id) {
        rates.delete(id);
    }
}
