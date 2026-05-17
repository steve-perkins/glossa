import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_pref')
export class UserPrefEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @OneToOne(() => UserEntity, (u) => u.pref)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ default: 'cream' })
  theme: string;

  @Column({ default: 'terracotta' })
  accent: string;

  @Column({ default: 'regular' })
  density: string;

  @Column({ name: 'target_language_id', type: 'varchar', nullable: true })
  targetLanguageId: string | null;
}
