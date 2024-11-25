import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { getStyles } from '../../common/helpers';

@ValidatorConstraint({ async: true })
@Injectable()
export class StyleValidationConstraint implements ValidatorConstraintInterface {
  private styles: string[] = [];

  async validate(value: string): Promise<boolean> {
    if (!this.styles.length) {
      this.styles = await getStyles();
    }

    return this.styles.some((style) => style === value);
  }

  defaultMessage(): string {
    return `Invalid Style, use one of ${this.styles}`;
  }
}
