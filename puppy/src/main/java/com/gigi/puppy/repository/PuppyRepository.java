package com.gigi.puppy.repository;

import com.gigi.puppy.model.Puppy;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@Repository
public class PuppyRepository implements JpaRepository<Puppy, Long> {

    @Override
    public List<Puppy> findAll() {
        return null;
    }

    @Override
    public List<Puppy> findAll(Sort sort) {
        return null;
    }

    @Override
    public Page<Puppy> findAll(Pageable pageable) {
        return null;
    }

    @Override
    public List<Puppy> findAllById(Iterable<Long> longs) {
        return null;
    }

    @Override
    public long count() {
        return 0;
    }

    @Override
    public void deleteById(Long aLong) {

    }

    @Override
    public void delete(Puppy entity) {

    }

    @Override
    public void deleteAllById(Iterable<? extends Long> longs) {

    }

    @Override
    public void deleteAll(Iterable<? extends Puppy> entities) {

    }

    @Override
    public void deleteAll() {

    }

    @Override
    public <S extends Puppy> S save(S entity) {
        return null;
    }

    @Override
    public <S extends Puppy> List<S> saveAll(Iterable<S> entities) {
        return null;
    }

    @Override
    public Optional<Puppy> findById(Long aLong) {
        return Optional.empty();
    }

    @Override
    public boolean existsById(Long aLong) {
        return false;
    }

    @Override
    public void flush() {

    }

    @Override
    public <S extends Puppy> S saveAndFlush(S entity) {
        return null;
    }

    @Override
    public <S extends Puppy> List<S> saveAllAndFlush(Iterable<S> entities) {
        return null;
    }

    @Override
    public void deleteAllInBatch(Iterable<Puppy> entities) {

    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Long> longs) {

    }

    @Override
    public void deleteAllInBatch() {

    }

    @Override
    public Puppy getOne(Long aLong) {
        return null;
    }

    @Override
    public Puppy getById(Long aLong) {
        return null;
    }

    @Override
    public <S extends Puppy> Optional<S> findOne(Example<S> example) {
        return Optional.empty();
    }

    @Override
    public <S extends Puppy> List<S> findAll(Example<S> example) {
        return null;
    }

    @Override
    public <S extends Puppy> List<S> findAll(Example<S> example, Sort sort) {
        return null;
    }

    @Override
    public <S extends Puppy> Page<S> findAll(Example<S> example, Pageable pageable) {
        return null;
    }

    @Override
    public <S extends Puppy> long count(Example<S> example) {
        return 0;
    }

    @Override
    public <S extends Puppy> boolean exists(Example<S> example) {
        return false;
    }

    @Override
    public <S extends Puppy, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return null;
    }
}
