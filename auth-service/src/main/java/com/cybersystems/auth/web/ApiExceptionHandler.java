package com.cybersystems.auth.web;

import com.cybersystems.auth.service.BadCredentialsException;
import com.cybersystems.auth.user.DataServiceUnavailableException;
import com.cybersystems.auth.user.LoginTakenException;
import com.cybersystems.auth.web.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> badCredentials(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("unauthorized", e.getMessage()));
    }

    @ExceptionHandler(LoginTakenException.class)
    public ResponseEntity<ErrorResponse> loginTaken(LoginTakenException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse("conflict", e.getMessage()));
    }

    @ExceptionHandler(DataServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> dataDown(DataServiceUnavailableException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse("bad_gateway", "Хранилище данных сейчас недоступно"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalid(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Неверный запрос");
        return ResponseEntity.badRequest().body(new ErrorResponse("bad_request", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> illegal(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("bad_request", e.getMessage()));
    }
}
