<template>
  <div class="dashboard-bg">
    <div class="dashboard-title">海洋生物知识库 - 数据总览</div>
    <a-row :gutter="24" class="stat-row">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="总阅读数" :value="statistic.totalViewCount" :value-style="{ color: '#1890ff' }" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="总点赞数" :value="statistic.totalVoteCount" :value-style="{ color: '#faad14' }" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="今日阅读" :value="statistic.todayViewCount" :value-style="{ color: '#52c41a' }" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="今日点赞" :value="statistic.todayVoteCount" :value-style="{ color: '#eb2f96' }" />
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="24" style="margin-top: 24px; margin-bottom: 40px;">
      <a-col :xs="24" :md="12">
        <a-card class="stat-card" title="今日预计">
          <a-statistic :value="statistic.todayViewEstimated" :value-style="{ color: '#722ed1', fontWeight: 'bold' }" />
          <div class="trend-percent">
            <span :style="{ color: statistic.todayViewIncreasePercent > 0 ? 'red' : 'green', fontWeight: 'bold' }">
              <arrow-up-outlined v-if="statistic.todayViewIncreasePercent > 0" />
              <arrow-down-outlined v-else />
              {{ Math.abs(statistic.todayViewIncreasePercent * 100).toFixed(2) }}%
            </span>
            <span style="margin-left: 10px; color: #888">较昨日</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card class="stat-card" title="30天趋势">
          <div id="trendChart" style="height: 320px; width: 100%"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';

const statistic = ref({
  totalViewCount: 0,
  totalVoteCount: 0,
  todayViewCount: 0,
  todayVoteCount: 0,
  todayViewEstimated: 0,
  todayViewIncreasePercent: 0
});

const loadHomeStatistic = async () => {
  const res = await axios.get('/statistic/home');
  statistic.value = res.data.content;
};

const load30DayTrend = async () => {
  const res = await axios.get('/statistic/trend/30days');
  initTrendChart(res.data.content);
};

const initTrendChart = (data: any[]) => {
  const chart = echarts.init(document.getElementById('trendChart'));
  const option = {
    backgroundColor: 'rgba(255,255,255,0)',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#1890ff',
      borderWidth: 1,
      textStyle: { color: '#333' }
    },
    legend: {
      data: ['阅读数', '点赞数'],
      top: 10
    },
    grid: { left: 30, right: 30, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLine: { lineStyle: { color: '#1890ff' } },
      axisLabel: { color: '#333' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#1890ff' } },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#333' }
    },
    series: [
      {
        name: '阅读数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#1890ff' },
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(24,144,255,0.08)' },
        data: data.map(item => item.viewCount)
      },
      {
        name: '点赞数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#faad14' },
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(250,173,20,0.08)' },
        data: data.map(item => item.voteCount)
      }
    ]
  };
  chart.setOption(option);
};

onMounted(() => {
  loadHomeStatistic();
  load30DayTrend();
});
</script>

<style scoped>
.dashboard-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 32px 16px 48px 16px;
}
.dashboard-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #1890ff;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(24,144,255,0.08);
}
.stat-row {
  margin-bottom: 0;
}
.stat-card {
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(24,144,255,0.10);
  transition: box-shadow 0.3s;
  background: #fff;
  margin-bottom: 24px;
}
.stat-card:hover {
  box-shadow: 0 8px 32px rgba(24,144,255,0.18);
}
.trend-percent {
  margin-top: 16px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.3rem;
    margin-bottom: 18px;
  }
  .stat-card {
    margin-bottom: 16px;
  }
  .trend-percent {
    font-size: 1rem;
  }
}
</style> 