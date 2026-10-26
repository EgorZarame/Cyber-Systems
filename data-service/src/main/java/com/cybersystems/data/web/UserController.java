package com.cybersystems.data.web;

import com.cybersystems.data.service.UserService;
import com.cybersystems.data.web.dto.CreateUserRequest;
import com.cybersystems.data.web.dto.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/internal/users")
public class UserController {

    private final UserService users;

    public UserController(UserService users) {
        this.users = users;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@Valid @RequestBody CreateUserRequest request) {
        return UserDto.from(users.register(request.login(), request.passwordHash()));
    }

    @GetMapping("/by-login/{login}")
    public UserDto byLogin(@PathVariable String login) {
        return UserDto.from(users.getByLogin(login));
    }

    @GetMapping("/{id}")
    public UserDto byId(@PathVariable UUID id) {
        return UserDto.from(users.getById(id));
    }
}
