package com.gigi.puppy.controller;


import com.gigi.puppy.model.Puppy;
import com.gigi.puppy.service.PuppyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("api")
public class PuppyController {
    @Autowired
    PuppyService puppyService;

    @RequestMapping(value="/puppys", method=RequestMethod.POST)
    public Puppy createPuppy(@RequestBody Puppy puppy) {
        return puppyService.createPuppy(puppy);
    }

    @RequestMapping(value="/puppys", method=RequestMethod.GET)
    public List<Puppy> readPuppys() {
        return puppyService.getPuppy();
    }

    @RequestMapping(value="/puppys/{puppyId}", method=RequestMethod.PUT)
    public Puppy readPuppys(@PathVariable(value = "puppyId") Long id, @RequestBody Puppy puppyDetails) {
        return puppyService.updatePuppy(id, puppyDetails);
    }

    @RequestMapping(value="/puppys/{puppyId}", method= RequestMethod.DELETE)
    public void deletePuppys(@PathVariable(value = "puppyId") Long id) {
        puppyService.deletePuppy(id);
    }
}
