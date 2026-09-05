package com.university.fms.repository;

import com.university.fms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.otpCode = :otp, u.otpExpiresAt = :expiresAt WHERE u.email = :email")
    int updateOtp(@Param("email") String email, @Param("otp") String otp, @Param("expiresAt") LocalDateTime expiresAt);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginCount = u.failedLoginCount + 1 WHERE u.email = :email")
    int incrementFailedLogins(@Param("email") String email);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginCount = 0, u.lockedUntil = null, u.lastLogin = :now, u.otpCode = null, u.otpExpiresAt = null, u.isEmailVerified = true WHERE u.email = :email")
    int resetLoginState(@Param("email") String email, @Param("now") LocalDateTime now);
}
