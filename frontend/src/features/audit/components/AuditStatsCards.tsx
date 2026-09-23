import { Card, Col, Empty, List, Progress, Row, Statistic, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { theme } from 'antd';
import type { AuditStats } from '../types/audit.types';

interface AuditStatsCardsProps {
  stats?: AuditStats;
  loading: boolean;
}

export function AuditStatsCards({ stats, loading }: AuditStatsCardsProps) {
  const { token } = theme.useToken();

  const dailyMax = useMemo(
    () => Math.max(1, ...(stats?.dailyTrend.map((d) => d.value) ?? [0])),
    [stats],
  );

  const totalByAction = useMemo(
    () =>
      Math.max(1, ...(stats?.byAction.map((a) => a.value) ?? [0])),
    [stats],
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic title="Total events" value={stats?.totalEvents ?? 0} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Success rate"
            value={stats?.successRate ?? 0}
            precision={1}
            suffix="%"
            prefix={
              <Progress
                type="circle"
                size={36}
                percent={Math.round(stats?.successRate ?? 0)}
                format={() => ''}
              />
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Avg response"
            value={stats?.avgDurationMs ?? 0}
            precision={1}
            suffix="ms"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic title="Events in last 24h" value={stats?.last24hCount ?? 0} />
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Events by action" loading={loading}>
          {(stats?.byAction.length ?? 0) === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
          ) : (
            <List
              size="small"
              dataSource={stats?.byAction ?? []}
              renderItem={(item) => (
                <List.Item style={{ paddingBlock: 8 }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Tag>{item.name}</Tag>
                      <Typography.Text>{item.value}</Typography.Text>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: token.colorFillSecondary,
                        borderRadius: token.borderRadiusSM,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(item.value / totalByAction) * 100}%`,
                          background: token.colorPrimary,
                          borderRadius: token.borderRadiusSM,
                        }}
                      />
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Top actors" loading={loading}>
          {(stats?.topActors.length ?? 0) === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
          ) : (
            <List
              size="small"
              dataSource={stats?.topActors ?? []}
              renderItem={(item) => (
                <List.Item style={{ paddingBlock: 8 }}>
                  <Typography.Text strong>{item.name}</Typography.Text>
                  <Typography.Text type="secondary">{item.value} events</Typography.Text>
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Daily trend" loading={loading}>
          {(stats?.dailyTrend.length ?? 0) === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
              {stats?.dailyTrend.map((day) => (
                <div
                  key={day.name}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    title={`${day.name}: ${day.value}`}
                    style={{
                      height: `${Math.max(4, (day.value / dailyMax) * 100)}%`,
                      background: token.colorPrimary,
                      borderRadius: `${token.borderRadiusSM}px ${token.borderRadiusSM}px 0 0`,
                    }}
                  />
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 10, textAlign: 'center', marginTop: 4 }}
                  >
                    {day.name.slice(5)}
                  </Typography.Text>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}