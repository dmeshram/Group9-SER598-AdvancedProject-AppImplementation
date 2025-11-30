package com.greenloop.backend.home;

public record HomeSummary (
    int totalPoints,
    int weeklyPoints,
    double co2SavedKg,
    int currentStreak
)
{}
