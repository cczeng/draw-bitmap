import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { saveData2Json } from './shared/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  dotBit: number = 8;
  dot = 1;

  dotWidth: string = '4px';

  dotZoom: string = '1x';

  formValue = {};

  form = new FormGroup({
    dot: new FormControl(),
    width: new FormControl(),
    height: new FormControl(),
    fileName: new FormControl(),
    dotWidth: new FormControl(),
  })

  bitmap: Array<Array<Number>> = [];

  isDownShift: boolean = false;

  pointXY: Array<number[]> = []; // 用于记录用户点击的

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event) {
    if (event.shiftKey) {
      console.log('keyDown', event.shiftKey);
      this.isDownShift = true;
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event) {
    if (!event.shiftKey) {
      console.log('keyup', event.shiftKey);
      this.isDownShift = false;
    }
  }


  constructor(
    private cdr: ChangeDetectorRef
  ) {

  }


  ngOnInit() {
    this.form.setValue({
      dot: 1,
      width: 100,
      height: 30,
      fileName: 'bitmap',
      dotWidth: 10
    });
    this.changeBitMap();
  }


  changeBitMap() {
    const values = this.form.value;
    this.dot = values.dot;

    this.dotWidth = values.dotWidth + 'px';

    if (this.formValue['width'] !== values.width || this.formValue['height'] !== values.height) {
      this.bitmap = Array.from({ length: values.height }, (cur, idx) => {
        return Array.from({ length: values.width }, (_, x) => 0);
      });
    }
    this.formValue = { ...values };
    this.cdr.detectChanges();
  }


  checke(row, dot) {

    this.pointXY.push([row, dot]);
    const copyBitmap = this.bitmap.slice();
    // 此处做动作
    if (this.isDownShift) {

      const [before, current] = this.pointXY;
      const yn = Math.abs(before[0] - current[0]) + 1;
      const xn = Math.abs(before[1] - current[1]) + 1;

      const startX = current[0] > before[0] ? before[0] : current[0];
      const startY = current[1] > before[1] ? before[1] : current[1];
      console.log('2次坐标', this.pointXY);
      console.log(`
        x 移动 ${xn}
        y 移动 ${yn}
        startX ${startX}
        startY ${startY}
      `);

      copyBitmap[before[0]][before[1]] = 0;
      for (let i = 0; i < yn; i++) {
        for (let j = 0; j < xn; j++) {
          copyBitmap[i + startX][j + startY] = copyBitmap[i + startX][j + startY] ? 0 : 1;
        }
      }
    } else {
      copyBitmap[row][dot] = copyBitmap[row][dot] ? 0 : 1;
    }
    if (this.pointXY.length === 2) {
      this.pointXY = [];
    }

    this.bitmap = [...copyBitmap];
    this.cdr.detectChanges();

  }


  download() {
    const { fileName, width, height } = this.form.value;
    saveData2Json(this.bitmap, `${width}-${height}-${fileName}.json`);
  }
}
