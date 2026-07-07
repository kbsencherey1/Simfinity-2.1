package com.simfinity.backend.util;

import java.security.SecureRandom;

public final class StringUtils {

    private static final String ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private StringUtils() {}

    public static String randomAlphaNum(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        return sb.toString();
    }
}
