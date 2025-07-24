import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { AnalysisRecord } from './AnalysisRecord';

@Entity('chart_records')
export class ChartRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['bazi', 'purple-star', 'integrated']
  })
  type: 'bazi' | 'purple-star' | 'integrated';

  @Column({ type: 'jsonb' })
  chartData: any;

  @Column({ type: 'jsonb' })
  metadata: {
    name?: string;
    birthDate: string;
    birthTime: string;
    location: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.charts, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => AnalysisRecord, analysis => analysis.chart)
  analyses: AnalysisRecord[];
}