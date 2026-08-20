import { Component } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {
  themeColor = 'default';

  ngOnInit(): void {
    const saved = sessionStorage.getItem('cms_theme');
    if (saved) this.themeColor = saved;
  }

  saveTheme() {
    sessionStorage.setItem('cms_theme', this.themeColor);
    alert('Theme saved! Please reload to see changes.');
  }
}
