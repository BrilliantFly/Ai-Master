package com.know.knowboot.service.plan.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.know.knowboot.entity.plan.PlanHabit;
import com.know.knowboot.entity.plan.PlanHabitRecord;
import com.know.knowboot.mapper.plan.PlanHabitMapper;
import com.know.knowboot.mapper.plan.PlanHabitRecordMapper;
import com.know.knowboot.service.plan.IPlanHabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 习惯服务实现
 */
@Service
public class PlanHabitServiceImpl extends ServiceImpl<PlanHabitMapper, PlanHabit> implements IPlanHabitService {

    @Autowired
    private PlanHabitMapper planHabitMapper;

    @Autowired
    private PlanHabitRecordMapper planHabitRecordMapper;

    @Override
    public IPage<PlanHabit> page(PlanHabit query, Long userId, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<PlanHabit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PlanHabit::getUserId, userId)
                .eq(query.getStatus() != null, PlanHabit::getStatus, query.getStatus())
                .like(query.getName() != null, PlanHabit::getName, query.getName())
                .orderByDesc(PlanHabit::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<PlanHabit> listByUserId(Long userId) {
        return list(new LambdaQueryWrapper<PlanHabit>()
                .eq(PlanHabit::getUserId, userId)
                .orderByDesc(PlanHabit::getCreateTime));
    }

    @Override
    public Map<String, Object> getStats(Long userId) {
        List<PlanHabit> habits = listByUserId(userId);
        long totalCount = habits.size();
        long activeCount = habits.stream().filter(h -> h.getStatus() == 0).count();
        long completedCount = habits.stream().filter(h -> h.getStatus() == 1).count();

        long totalCheckins = planHabitRecordMapper.selectCount(
                new LambdaQueryWrapper<PlanHabitRecord>()
                        .eq(PlanHabitRecord::getUserId, userId));

        // 今日打卡数
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        long todayStart = cal.getTimeInMillis();
        cal.add(Calendar.DAY_OF_MONTH, 1);
        long todayEnd = cal.getTimeInMillis();

        long todayCheckins = planHabitRecordMapper.selectCount(
                new LambdaQueryWrapper<PlanHabitRecord>()
                        .eq(PlanHabitRecord::getUserId, userId)
                        .ge(PlanHabitRecord::getRecordDate, todayStart)
                        .lt(PlanHabitRecord::getRecordDate, todayEnd));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", totalCount);
        stats.put("activeCount", activeCount);
        stats.put("completedCount", completedCount);
        stats.put("totalCheckins", totalCheckins);
        stats.put("todayCheckins", todayCheckins);
        return stats;
    }

    @Override
    public PlanHabit getById(Long id) {
        return planHabitMapper.selectById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean add(PlanHabit habit, Long userId) {
        habit.setUserId(userId);
        habit.setCreateBy(userId);
        habit.setCreateTime(System.currentTimeMillis());
        if (habit.getStatus() == null) {
            habit.setStatus(0); // 进行中
        }
        if (habit.getCurrentDays() == null) {
            habit.setCurrentDays(0);
        }
        if (habit.getTotalDays() == null) {
            habit.setTotalDays(0);
        }
        if (habit.getTargetDays() == null) {
            habit.setTargetDays(30);
        }
        return save(habit);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(PlanHabit habit) {
        habit.setUpdateTime(System.currentTimeMillis());
        return updateById(habit);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean checkin(Long habitId, Long userId) {
        return checkin(habitId, userId, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean checkin(Long habitId, Long userId, Long recordDate) {
        PlanHabit habit = planHabitMapper.selectById(habitId);
        if (habit == null) {
            return false;
        }

        long now = System.currentTimeMillis();
        // 归一化到当天0点（如果没传日期则使用当前时间）
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTimeInMillis(recordDate != null ? recordDate : now);
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        long dayStart = cal.getTimeInMillis();

        // 检查是否已打卡
        Long exists = planHabitRecordMapper.selectCount(
                new LambdaQueryWrapper<PlanHabitRecord>()
                        .eq(PlanHabitRecord::getHabitId, habitId)
                        .eq(PlanHabitRecord::getRecordDate, dayStart));
        if (exists != null && exists > 0) {
            return false; // 已打卡，防止重复
        }

        // 创建打卡记录
        PlanHabitRecord record = new PlanHabitRecord();
        record.setHabitId(habitId);
        record.setRecordDate(dayStart);
        record.setUserId(userId);
        record.setCreateBy(userId);
        record.setCreateTime(now);
        planHabitRecordMapper.insert(record);

        // 更新习惯统计
        habit.setTotalDays(habit.getTotalDays() + 1);
        habit.setCurrentDays(calculateStreak(habitId, dayStart));
        habit.setUpdateTime(now);

        // 检查是否达成目标
        if (habit.getTotalDays() >= habit.getTargetDays()) {
            habit.setStatus(1); // 已完成
        }

        planHabitMapper.updateById(habit);
        return true;
    }



    @Override
    public List<PlanHabitRecord> getRecords(Long habitId) {
        return planHabitRecordMapper.selectList(
                new LambdaQueryWrapper<PlanHabitRecord>()
                        .eq(PlanHabitRecord::getHabitId, habitId)
                        .orderByDesc(PlanHabitRecord::getRecordDate));
    }

    /**
     * 计算连续打卡天数
     */
    private int calculateStreak(Long habitId, long todayStart) {
        int streak = 0;
        long dayStart = todayStart;
        long oneDay = 24 * 60 * 60 * 1000L;

        while (true) {
            Long count = planHabitRecordMapper.selectCount(
                    new LambdaQueryWrapper<PlanHabitRecord>()
                            .eq(PlanHabitRecord::getHabitId, habitId)
                            .eq(PlanHabitRecord::getRecordDate, dayStart));
            if (count != null && count > 0) {
                streak++;
                dayStart -= oneDay; // 往前一天
            } else {
                break;
            }
        }

        return streak;
    }
}
