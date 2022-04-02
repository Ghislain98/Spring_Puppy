package com.gigi.puppy.repository;

import com.gigi.puppy.model.Puppy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PuppyRepository extends CrudRepository<Puppy, Long> {
}