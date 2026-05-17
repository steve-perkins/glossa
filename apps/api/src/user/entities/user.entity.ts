import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { UserPrefEntity } from './user-pref.entity';

@Entity('app_user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'google_sub', unique: true })
  googleSub: string;

  @Column()
  email: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => UserPrefEntity, (p) => p.user)
  pref?: UserPrefEntity;
}
