import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { ChartRecord } from './ChartRecord';

@Entity('analysis_records')
export class AnalysisRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  chartId: string;

  @Column()
  analysisType: string;

  @Column({ type: 'jsonb' })
  result: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.analyses, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ChartRecord, chart => chart.analyses, { nullable: true })
  @JoinColumn({ name: 'chartId' })
  chart: ChartRecord;
}