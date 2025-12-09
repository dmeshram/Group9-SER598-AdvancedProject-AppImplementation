package com.greenloop.backend.history;

import java.util.List;

public class HistoryResponse {

    private int streakDays;
    private List<AchievementItem> achievements;
    private List<ActivityItem> completedActivities;
    private List<Co2TrendPoint> co2Trend;
    private List<CalendarEntry> calendar;

    public int getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(int streakDays) {
        this.streakDays = streakDays;
    }

    public List<AchievementItem> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementItem> achievements) {
        this.achievements = achievements;
    }

    public List<ActivityItem> getCompletedActivities() {
        return completedActivities;
    }

    public void setCompletedActivities(List<ActivityItem> completedActivities) {
        this.completedActivities = completedActivities;
    }

    public List<Co2TrendPoint> getCo2Trend() {
        return co2Trend;
    }

    public void setCo2Trend(List<Co2TrendPoint> co2Trend) {
        this.co2Trend = co2Trend;
    }

    public List<CalendarEntry> getCalendar() {
        return calendar;
    }

    public void setCalendar(List<CalendarEntry> calendar) {
        this.calendar = calendar;
    }

    // ---------- Inner DTOs ----------

    public static class AchievementItem {
        private String id;
        private String title;
        private String date; // ISO string

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    public static class ActivityItem {
        private String date;     // ISO
        private String activity; // label
        private double co2Saved; // kg

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getActivity() { return activity; }
        public void setActivity(String activity) { this.activity = activity; }

        public double getCo2Saved() { return co2Saved; }
        public void setCo2Saved(double co2Saved) { this.co2Saved = co2Saved; }
    }

    public static class Co2TrendPoint {
        private String day; // e.g. "Mon"
        private double kg;

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }

        public double getKg() { return kg; }
        public void setKg(double kg) { this.kg = kg; }
    }

    public static class CalendarEntry {
        private String date;    // ISO
        private boolean completed;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }
}