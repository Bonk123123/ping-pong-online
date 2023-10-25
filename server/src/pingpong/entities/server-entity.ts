import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Servers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  server_name: string;

  @Column({ nullable: true })
  player1: string;

  @Column({ nullable: true })
  player2: string;
}
