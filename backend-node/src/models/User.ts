import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChartRecord } from './ChartRecord';
import { AnalysisRecord } from './AnalysisRecord';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: 'Asia/Taipei' })
  timezone: string;

  @Column({ 
    type: 'enum',
    enum: ['anonymous', 'member', 'vip'],
    default: 'anonymous'
  })
  membershipLevel: 'anonymous' | 'member' | 'vip';

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    language: string;
    displayMode: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChartRecord, chart => chart.user)
  charts: ChartRecord[];

  @OneToMany(() => AnalysisRecord, analysis => analysis.user)
  analyses: AnalysisRecord[];
}