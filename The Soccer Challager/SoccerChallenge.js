import {defs, tiny} from './examples/common.js';
import {Body, Simulation, Test_Data} from './examples/collisions-demo.js';
import {objs} from './models.js';
//import { Simulation } from './examples/control-demo.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Capped_Cylinder, Rounded_Closed_Cone, Textured_Phong_text, Phong_Shader, Regular_2D_Polygon, Closed_Cone } = defs;
const {SceneGraph, HumanFigure, soccerNet, Block1, Block2, Chick, Chicken, BoundingBox, Soccer_ball, Flower, SoccerFieldBoundary, Arrow, Decorate} = objs




export class Main extends Simulation {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        

        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .52, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/blue.png")
            }),
            block2: new Material(new Textured_Phong(), {
                color: hex_color("#ff745e"),
                ambient: .6, diffusivity: .1, specularity: 0.5,
                texture: new Texture("assets/block.jpg")
            }),

            
            net: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .4, diffusivity: .4, specularity: 0.5,

                texture: new Texture("assets/net21.png")
            }),
            sky: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .5, diffusivity:.1, specularity: 0.1,
                texture: new Texture("assets/sky2.png"),
            }),
            blank: new Material(new Textured_Phong(), {
                color: hex_color("#edef00"),
                ambient: .5, diffusivity: 1, specularity: .1,
                texture: new Texture("assets/white.jpeg")
            }),
            ball_skin: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.48, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/ball.png")
            }),
            grass: new Material(new Textured_Phong(), {
                color: hex_color("#00FF00"), // 绿色草地
                ambient: 0.4, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "LINEAR_MIPMAP_LINEAR")


            }),
            boundary_material: new Material(new Textured_Phong(),
            {   ambient: 1, 
                color: color(1, 1, 1, 1)
            
            }),
            arrow_skin: new Material(new defs.Phong_Shader(),
            {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#B4213A")}),
 
        }
        this.shapes = {
            flower: new Flower(this.materials.blank, Mat4.identity()),
            human: new HumanFigure(this.materials.phong, Mat4.scale(.8, .8, .8).times(Mat4.translation(0, 1.875, 0))),
            net: new soccerNet(this.materials.net, Mat4.translation(0, 3, -30).times(Mat4.rotation(Math.PI, 0, 1, 0))),
            poly: new Regular_2D_Polygon(4, 2),
            box: new Cube(),
            sphere: new Subdivision_Sphere(4),
            block: new Block1(this.materials.phong, Mat4.identity()),
            chick: new Chick(this.materials.blank, Mat4.translation(0, 0, 0)),
            chicken:new Chicken(this.materials.blank, Mat4.translation(0 ,1.8, 0)),
            block2: new Block2(this.materials.block2, Mat4.identity().times(Mat4.translation(0, 0, 0))),
            field: new Regular_2D_Polygon(100, 100), // 4个顶点，1表示矩形
            ball: new Soccer_ball(this.materials.ball_skin, Mat4.scale(0.7, 0.7, 0.7)),
            field_boundary: new SoccerFieldBoundary(this.materials.boundary_material, Mat4.identity()),
            arrow: new Arrow(this.materials.arrow_skin, Mat4.identity()),
            tree: new Decorate(this.materials.blank, Mat4.identity())

        }
        
//music        
        this.backgroundMusic = new Audio('music/background_music.mp3');
        this.backgroundMusic.loop = true;
        
        this.flower_trans = [Mat4.translation(15, .1, -12), Mat4.translation(5, .1, 18), Mat4.translation(-12, .1, -2)
                            ,Mat4.translation(-6, .1, 7), Mat4.translation(-3, .1, 25), Mat4.translation(11, .1, 3)]

//human related

        


        this.moving = false
        this.forward = false
        this.back = false
        this.left = false
        this.right = false

        this.double_collide = false
        this.collision = false
        this.face = "forward"
        this.agent_trans = Mat4.identity() // store the character's translation value
        this.agent_pos = vec3(0, -.25, 30)
        this.agent_rot = vec4(0,0,0,0)   // store the character's rotation state 
        this.agent_size = 0.8      // scale

//ball related
        this.ball_pos = vec3(0,0.7,29)  
        this.linear_velocity_yz = vec3(0,0,0)
        //this.div_v = vec3(0,0,0)
        this.kick = false
        this.get_goal = false
        this.ball_out = false
        this.movement_face
        this.ball_collision = false
        this.time = 0
        this.kick_angle_hon = 0
        this.varying_angle = 0
        this.incre = false
        this.touching_ball_time = 0
        this.within_range = false

//perspectives
        this.initial_camera_location = Mat4.look_at(vec3(-15, 8, 40), vec3(5, 0, 0), vec3(0, 5, 0));
        this.first = false
        this.second = false
        this.third = false
        this.initial = false
        
        
//random-refresh related
        this.still_items = [this.shapes.net, this.shapes.chicken]
        this.types = ["block1", "chick", "block2"]
        this.areas = [[Math.random() * (-14+20) -20, Math.random() * (20-10) +10], 
                        [Math.random() * (-14+20) -20, Math.random() * (-10+20) -20], 
                        [Math.random() * (-14+20) -20, Math.random() * (5+5) -5], 
                        [Math.random() * (4+4) -4, Math.random() * (20-10) +10],
                        [Math.random() * (4+4) -4, Math.random() * (-10+20) - 20],
                        [Math.random() * (4+4) -4, Math.random() * (5+5) -5],
                        [Math.random() * (22-16) +16, Math.random() * (20-10) +10], 
                        [Math.random() * (22-16) +16, Math.random() * (-10+20) - 20],
                        [Math.random() * (22-16) +16, Math.random() * (5+5) -5]]
        //随机鸡群位置
        let random = Math.floor(Math.random() * (8-0) + 0)
        this.chicken_pos = this.areas[random]

        //必须保证鸡群刷新位置在bound最左侧，不然会发生障碍物之间的碰撞
        this.counter = this.chicken_pos[0]
        //console.log(this.chicken_pos[0])
        if (this.counter <= -14) {this.counter = -19}
        else if (this.counter <= 4) {this.counter = -3}
        else {
            this.counter = 14}
        //console.log(this.counter)
        this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.translation(this.counter, 0, this.chicken_pos[1])) 
        for (let i = 0; i < this.shapes.field.arrays.texture_coord.length; ++i) {
            this.shapes.field.arrays.texture_coord[i].scale_by(12)
        } 
        //位置列表中去除鸡群位置
        this.areas.splice(random, 1)

//bounding setting
        this.boundings = [new BoundingBox(this.areas[0][0], 0, this.areas[0][1], 0, 0, 0),
        new BoundingBox(this.areas[1][0], 0, this.areas[1][1], 0, 0, 0),
        new BoundingBox(this.areas[2][0], 0, this.areas[2][1], 0, 0, 0),
        new BoundingBox(this.areas[3][0], 0, this.areas[3][1], 0, 0, 0),
        new BoundingBox(this.areas[4][0], 0, this.areas[4][1], 0, 0, 0),
        new BoundingBox(this.areas[5][0], 0, this.areas[5][1], 0, 0, 0),
        new BoundingBox(this.areas[6][0], 0, this.areas[6][1], 0, 0, 0),
        new BoundingBox(this.areas[7][0], 0, this.areas[7][1], 0, 0, 0)]

 
//chick moving        
        this.direction = 1


        this.length = 5
        this.temp = this.length
        this.chicken_direction = true
    

//random_refresh: 填充this.still_items 列表，随机位置，随机物件
        let num = 0
        for (let i of this.areas) {
            this.random_refresh(i, num)
            num++

       

        }
        
    }

 

    make_control_panel() {

    // music
        this.key_triggered_button("Toggle Music", ["m"], () => {
            this.toggleMusic();
        });
    // perspectives



        this.key_triggered_button("Follow Human", ["Control", "1"], () => {
            this.first = true
            this.second = false
            this.third = false
        });

        this.key_triggered_button("Camera from Left", ["Control", "2"], () => {
            this.first = false
            this.second = true
            this.third = false
        });
        this.key_triggered_button("Camera from Right", ["Control", "3"], () => {
            this.first = false
            this.second = false
            this.third = true
        });



        this.key_triggered_button("Initial Perspective", ["Control", "4"], () => {
            this.first = false
            this.second = false
            this.third = false

            this.initial = true
        });
    //restart    

        this.key_triggered_button("Restart", ["r"], () => {

            this.restart()
  
        });

    //human movement

        

        this.key_triggered_button("Move Forward", ["ArrowUp"], () => {
            this.moving = true
            this.forward = true 
            
        }, undefined, () => {
            this.moving = false
            this.forward = false
        });

        this.key_triggered_button("Move Backward", ["ArrowDown"], () => {
            this.moving = true
            this.back = true


     



        }, undefined, () => {
            this.moving = false
            this.back = false
        });

        this.key_triggered_button("Move Left", ["ArrowLeft"], () => {
            this.moving = true
            this.left = true

        }, undefined, () => {
            this.moving = false
            this.left = false
        });

        this.key_triggered_button("Move Right", ["ArrowRight"], () => {
            this.moving = true
            this.right = true

        }, undefined, () => {
            this.moving = false
            this.right = false
        });

    //kick


        this.key_triggered_button("Kick", ["k"], () =>{
            if (this.shapes.human.bound.close (this.shapes.ball.bound)) {
                this.kick = true
                this.time = 0
                this.last_pos = vec3(0,0,0)
                this.linear_velocity_yz = vec3(0,0,0)
                this.within_range = false
            }
        })

    }

// music

 

    playMusic() {
        this.backgroundMusic.play().catch(e => console.error("Error playing music:", e));
    }
    pauseMusic() {
        this.backgroundMusic.pause();
    }
    toggleMusic() {
        if (this.backgroundMusic.paused) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }


    restart() {
        caches.delete()
        location.reload()
    }
    set_camera_init(program_state) {
        program_state.camera_inverse = Mat4.rotation(Math.PI/10, 1, 0, 0).times(Mat4.translation(-this.agent_pos[0],this.agent_pos[1] - 8,-this.agent_pos[2] - 12)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1))
        
    }

    

//obstacle placing
    
    //random_refresh: refresh the blocks in the given area
    random_refresh(area, num, type=this.types[Math.floor(Math.random()*this.types.length)]) {
        if (type == "block1") {
        this.still_items.push(this.shapes.block)
    
        this.boundings[num].x = area[0]

        this.boundings[num].z = area[1]
        this.boundings[num].y = 6*.7*.5
        this.boundings[num].width = 9.2*.7
        this.boundings[num].height = 6*.7
        this.boundings[num].depth = .2*.7
    //console.log(this.boundings[num].w, this.boundings[num].h, this.boundings[num].d)
    }
        else if (type == "chick") {
        this.still_items.push(this.shapes.chick)
        this.boundings[num].x = area[0]
        this.boundings[num].z = area[1]
        this.boundings[num].y = 1.8
        this.boundings[num].width = 1.2
        this.boundings[num].height = 3.6
        this.boundings[num].depth = 3
        //console.log(this.boundings[num].w, this.boundings[num].h, this.boundings[num].d)
    }
        else if (type == "block2") {
        this.still_items.push(this.shapes.block2)
        this.boundings[num].x = area[0]
        this.boundings[num].z = area[1]
        this.boundings[num].y = .85
        this.boundings[num].width = 1
        this.boundings[num].height = 1.5
        this.boundings[num].depth = 1}

   
 

        
    }

    //鸡群移动，length = 10
    move_chicken(chicken, dt=this.dt) {
        let speed = 5
        let temp = dt*speed
            chicken.update_pos()
            chicken.update_bound()
            chicken.wobble(this.t, this.direction)
            
            if (this.chicken_direction) {
            chicken.model_transform[0][3] = chicken.model_transform[0][3] + temp
            }
            
            else {
                chicken.model_transform[0][3] = chicken.model_transform[0][3] - temp}

            return temp
    

    }


// For stopping human after an obstacle collision
        stop_human_figure() {
            this.moving = false
            this.shapes.human.stop_swin()
        }

//kicking ball

    kicking_ball(ball, dt=this.dt) {

        let kick_angle = -Math.sin(this.kick_angle_hon)/10 
        if(this.movement_face == "left" || this.movement_face == "right")
            kick_angle = Math.cos(this.kick_angle_hon)/10 


        let x_friction = .48
        let y_friction = .98
        let x_v = 8
        let y_v = 5
        let div_v = vec3(0,0,0)
        
        
        if(this.time == 0)
            this.movement_face = this.face; // prevent the angle change while the movement
        if(this.movement_face == "forward")
        {
            if (this.ball_collision) {

                this.double_collide = true
                // linear_velocity_yz is a velocity vector that has magnitude and direction in every this.time unit(like real time)
                this.linear_velocity_yz[2] = (x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle
                // point + vector = movement
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[2] = -(x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle
                
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "backward")
        {
            if (this.ball_collision) {
                this.double_collide = true
                this.linear_velocity_yz[2] = -(x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[2] = (x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "left")
        {
            if (this.ball_collision) {
                this.double_collide = true
                this.linear_velocity_yz[0] = (x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[0] = -(x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "right")
        {
            if (this.ball_collision) {
                this.double_collide = true
                this.linear_velocity_yz[0] = -(x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);           
            }
            else{
                this.linear_velocity_yz[0] = (x_v*(this.time/1000) - x_friction*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = y_v*(this.time/1000) - y_friction*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }
// spinning
        div_v = this.linear_velocity_yz.minus(div_v)    //velocity vector
        let rotation_angle = Math.abs(div_v.norm() / .8 * this.time * 20)/360; 
        
        //console.log(rotation_angle)
        
        if(this.face == "backward")
            ball.model_transform = ball.model_transform.times(Mat4.rotation(rotation_angle,1,0,0))
        else if(this.face == "left")
            ball.model_transform = ball.model_transform.times(Mat4.rotation(rotation_angle,0,0,1))
        else if(this.face == "right")
            ball.model_transform = ball.model_transform.times(Mat4.rotation(-rotation_angle,0,0,1))
        else
            ball.model_transform = ball.model_transform.times(Mat4.rotation(-rotation_angle,1,0,0))
                                         
                                                   
         ++this.time;

        if(this.ball_pos[1]<0.68)
        {
            this.kick = false;
            this.double_collide = false
            this.ball_collision = false;

            this.ball_pos[1] = .699     // correct the position
            // rotate back to the center
            if(this.face == "backward")
                ball.model_transform = ball.model_transform.times(Mat4.rotation(-rotation_angle,1,0,0))
            else if(this.face == "left")
                ball.model_transform = ball.model_transform.times(Mat4.rotation(-rotation_angle,0,0,1))
            else if(this.face == "right")
                ball.model_transform = ball.model_transform.times(Mat4.rotation(rotation_angle,0,0,1))
            else
                ball.model_transform = ball.model_transform.times(Mat4.rotation(rotation_angle,1,0,0))
        }
            
    }
   
//checking goal / boundary / kicking range
    check_goal()
    {// check passing through the imagine goal
        if((this.ball_pos[0] >= -4.6 && this.ball_pos[0] <= 5.2) &&  // -4.6 < x < 5.2
           (this.ball_pos[1] >= .9 && this.ball_pos[1] <= 4.7) &&    // 0.9 < y < 4.7
           (this.ball_pos[2] <= -25) )                             //       z < -25
            {
                this.get_goal = true;
                this.success_jump()
                window.endGame("You Won!");
            }    
            // console.log(this.ball_pos)
            // console.log(this.get_goal)
    }

    success_jump()
    {
        this.kick = false
        
        
        //console.log(this.agent_pos)
        // this.agent_pos = vec3(0, -.25, 30)
        // this.ball_pos = vec3(0, -.25, 30)
        this.ball_pos = this.agent_pos
        this.ball_pos[1] += 2
        //vec3(0.14,5,-20.8)
    }


    check_out_of_bound()
    {// check passing through the boundary
        if((this.ball_pos[0] <= -28 || this.ball_pos[0] >= 29) ||  // -28 < x < 29
           (this.ball_pos[2] <= -25 || this.ball_pos[2] >= 38) )     // -25 < z < 38                
                this.ball_out = true;
            //console.log(this.ball_out)
        
        // respawn human and ball
        if(this.ball_out)
        {
            this.ball_pos = vec3(0,0.7,29);
            this.agent_pos = vec3(0, -.25, 30);
            if(this.face == "backward")
                this.agent_rot[0] -= Math.PI;
            else if(this.face == "left")
                this.agent_rot[0] -= Math.PI/2;
            else if(this.face == "right")
                this.agent_rot[0] += Math.PI/2;
              
            this.ball_out = false;
            this.kick = false;
            this.face = "forward";
        }
    }

    check_human_boundary()
    {
        if(this.agent_pos[0] <= -30)
            this.agent_pos[0] += 0.2
        else if(this.agent_pos[0] >= 31)
            this.agent_pos[0] -= 0.2
        else if(this.agent_pos[2] <= -27)
            this.agent_pos[2] += 0.2
        else if(this.agent_pos[2] >= 40)
            this.agent_pos[2] -= 0.2
    }

    within_the_range(){
        
        let in_range = false
        if(this.face == "forward")
        {
            if((this.agent_pos[2] > this.ball_pos[2]) &&
               (this.agent_pos[0] <= this.ball_pos[0] + 1) &&
               (this.agent_pos[0] >= this.ball_pos[0] - 1))
                in_range = true
        }
        else if(this.face == "backward")
        {
            if((this.agent_pos[2] < this.ball_pos[2]) &&
               (this.agent_pos[0] <= this.ball_pos[0] + 1) &&
               (this.agent_pos[0] >= this.ball_pos[0] - 1))
                in_range = true
        }
        else if(this.face == "left")
        {
            if((this.agent_pos[0] > this.ball_pos[0]) &&
               (this.agent_pos[2] <= this.ball_pos[2] + 1) &&
               (this.agent_pos[2] >= this.ball_pos[2] - 1))
                in_range = true
        }
        else if(this.face == "right")
        {
            if((this.agent_pos[0] < this.ball_pos[0]) &&
               (this.agent_pos[2] <= this.ball_pos[2] + 1) &&
               (this.agent_pos[2] >= this.ball_pos[2] - 1))
                in_range = true
        }
        
        return in_range
    }

//drawing arrow    
    drawing_arrow(arrow, dt = this.dt)
    {
        // dont ask Howard how did he come up with this, too complicated, he doesnt know how to explain
        if(!this.kick)
        {
            if(this.face == "backward")
            {
                if(this.touching_ball_time == 0)
                    this.varying_angle -= Math.PI;
                if(this.varying_angle >= (Math.PI/4 - Math.PI))
                    this.incre = true
                else if(this.varying_angle <= (-Math.PI/4 - Math.PI))
                    this.incre = false
            }
            else if(this.face == "left")
            {
                if(this.touching_ball_time == 0)
                    this.varying_angle += Math.PI/2;
                if(this.varying_angle >= (Math.PI/4 + Math.PI/2))
                    this.incre = true
                else if(this.varying_angle <= (-Math.PI/4 + Math.PI/2))
                    this.incre = false
            }
            else if(this.face == "right")
            {
                if(this.touching_ball_time == 0)
                    this.varying_angle -= Math.PI/2;
                if(this.varying_angle >= (Math.PI/4 - Math.PI/2))
                    this.incre = true
                else if(this.varying_angle <= (-Math.PI/4 - Math.PI/2))
                    this.incre = false
            }
            else{
                if(this.varying_angle >= Math.PI/4)
                    this.incre = true
                else if(this.varying_angle <= -Math.PI/4)
                    this.incre = false
            }
            

            if(!this.incre)
                this.varying_angle += Math.PI/180 * dt*40
            else
                this.varying_angle -= Math.PI/180 * dt*40
            
           
            this.kick_angle_hon = this.varying_angle;
            ++this.touching_ball_time
        }
        
        arrow.model_transform = Mat4.translation(this.agent_pos[0], this.agent_pos[1] + 4.5, this.agent_pos[2])
                                    .times(Mat4.rotation(this.varying_angle,0,1,0))
                                    .times(Mat4.rotation(Math.PI/16,1,0,0))
                                    .times(Mat4.translation(0,0,-2))

        


    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)));
        }

        

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 1000);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.t = program_state.animation_time / 1000;
        this.dt = program_state.animation_delta_time / 1000;


//Draw field
        let field_transform = Mat4.identity()
                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0)) // Rotate to lay it flat
                        .times(Mat4.scale(80, 80, 80)); // Scale to the size of a soccer field
        this.shapes.field.draw(context, program_state, field_transform, this.materials.grass.override({color:hex_color("99ff66")}));
        this.shapes.field_boundary.draw(context, program_state, Mat4.identity())
        
        // box 是表示四周的环境，我们可以改成其他的景色
        this.shapes.sphere.draw(context, program_state, Mat4.identity().times(Mat4.rotation(Math.PI/1.5, 0,1,0)).times(Mat4.scale(80, 80, 80)), this.materials.sky)

//Draw arrow
        let touch = false
        if(this.shapes.human.bound.close (this.shapes.ball.bound)
        &&(this.within_the_range()))
        {
            this.drawing_arrow(this.shapes.arrow)
            this.shapes.arrow.draw(context, program_state)
            touch = true
        }
        
        if(!touch)
        {
            this.touching_ball_time = 0;
            this.incre = false
            this.varying_angle = 0;
        }
        
    
//human
        this.check_human_boundary()
        //check direction and face orientation
        //console.log(this.kick)

        const check = (element) => this.shapes.human.bound.intersects(element) == true
        const check2 = (element) => this.shapes.ball.bound.intersects(element) == true
        console.log(this.double_collide)
        /* if (this.boundings.some(check2) == false) {console.log("case1")}
        if (!this.double_collide) {console.log("case2")} */
        if (this.moving && ! this.collision) { 
            let speed = 10.0;
            this.shapes.human.swingArm(program_state.animation_time / 300)  // Changing the swing time
            this.shapes.human.swingLeg(program_state.animation_time / 300)
            if (this.forward) {
                if(this.face != "forward")
                {
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}  //Rotate 90° to the left
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;} //Rotate 90° to the right
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;} //Rotate 180° to the backward
                
                    this.face = "forward";
                }
                this.human_direction = this.face
                this.agent_pos[2] -= this.dt * speed;  // Decrease the human's Z-axis value
    
            }
            if (this.back) {
                
                if(this.face != "backward")
                {
                    
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    
                    this.face = "backward";
                }
                this.human_direction = this.face
                this.agent_pos[2] += this.dt * speed;
              
            }
            if (this.left) {
                
                if(this.face != "left")
                {
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
    
                    this.face = "left";
                }
                this.human_direction = this.face
                this.agent_pos[0] -= this.dt * speed;
                
            }
            if (this.right) {
                
                if(this.face != "right")
                {
                   
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    
                    this.face = "right";
                }
                this.human_direction = this.face
                this.agent_pos[0] += this.dt * speed;
                
            }
        
        }else if (this.collision && (this.human_direction == this.face || (this.shapes.human.bound.intersects(this.shapes.ball.bound)) && !this.boundings.some(check))) {
            //.2 is used to fine-tune the position of the character in the event of a collision, 
            //so that it can "move back" or "move away" from the colliding object slightly.
            if (this.face == "forward"){
                this.agent_pos[2] += .2
                this.human_direction = "backward"
            } 
            if (this.face == "backward") {
                this.agent_pos[2] -= .2
                this.human_direction = "forward"
            }
            if (this.face == "left") {
                this.agent_pos[0] += .2
                this.human_direction = "right"
            }
            if (this.face == "right") {
                this.agent_pos[0] -= .2
                this.human_direction = "left"
            }

            this.stop_human_figure()  // let move = false
        }
        //thi.kick is false after the ball stable on the ground
        //else if ((this.collision||(this.double_collide)) && this.human_direction != this.face && (this.boundings.some(check)|| this.boundings.some(check2)))

        else if ((this.collision && this.human_direction != this.face) || (this.double_collide && (this.boundings.some(check2) || (this.shapes.ball.bound.intersects(this.shapes.chicken.bound)))))
        {
            console.log("enter")
            let j = 0
            let temp
            for (let i of this.boundings) {
                if (i.intersects(this.shapes.ball.bound)) {
                    temp = j
                }
                j++
            }
            if (this.shapes.ball.bound.intersects(this.shapes.chicken.bound)) {
                temp = 10
            }
            if (this.face == "forward") {
                if (this.collision && !this.shapes.human.bound.intersects(this.shapes.ball.bound))
                this.agent_pos[2] -= .1
                /* if (this.ball_collision)
                this.ball_pos[2] -= this.linear_velocity_yz[2] */
            }
            if (this.face == "backward") {
                if (this.collision &&!this.shapes.human.bound.intersects(this.shapes.ball.bound))
                this.agent_pos[2] += .1
                /* if (this.ball_collision)
                this.ball_pos[2] += this.linear_velocity_yz[2] */
            }
            if (this.face == "left") {
                if (this.collition)
                this.agent_pos[0] -= .1
                /* if  (this.ball_collision)
                this.ball_pos[0] -= this.linear_velocity_yz[0] */
            }
            if (this.face == "right") {
                if (this.collision)
                this.agent_pos[0] += .1
                /* if (this.ball_collision)
                this.ball_pos[0] += this.linear_velocity_yz[0] */
            }
            if (this.movement_face == "forward") {
                console.log(this.current_collide, temp)
                if ((this.boundings.some(check2) || this.shapes.ball.bound.intersects(this.shapes.chicken.bound)) && this.double_collide && temp != this.current_collide) {
                        console.log("gg")
                    this.ball_pos[2] -= 1
            
                    console.log("here")
                }
                if (this.collision) {
                    this.ball_pos[2] -= .3
                }
            }
            if (this.movement_face == "backward") {
                if ((this.boundings.some(check2) || this.shapes.ball.bound.intersects(this.shapes.chicken.bound)) && this.double_collide && temp != this.current_collide) {
                    console.log(1234)
                    this.ball_pos[2] += 1
                    
                    console.log("there")
                }
                if (this.collision) {
                    console.log(999)

                    this.ball_pos[2] += 0.3
                }
            }
            if (this.movement_face == "left") {
                if ((this.boundings.some(check2) || this.shapes.ball.bound.intersects(this.shapes.chicken.bound)) && this.double_collide && temp != this.current_collide) {
                    this.ball_pos[0] -= 1
                }
                if (this.collision) {
                    this.ball_pos[0] -= 0.3
                }
            }
            if (this.movement_face == "right") {
                if ((this.boundings.some(check2) || this.shapes.ball.bound.intersects(this.shapes.chicken.bound)) && this.double_collide && temp != this.current_collide) {
                    this.ball_pos[0] += 1
                }
                if (this.collision) {
                    this.ball_pos[0] += 0.3
                }
            

        }
            
        }
        else if (this.kick && this.within_the_range()) {this.shapes.human.swingLeft(this.t)}
        else if (!this.lr) {this.stop_human_figure()}

    //draw human    
        this.agent_trans = Mat4.translation(this.agent_pos[0], this.agent_pos[1], this.agent_pos[2])
                                .times(Mat4.rotation(this.agent_rot[0],0,1,0))
                                .times(Mat4.scale(this.agent_size,this.agent_size,this.agent_size));
        //console.log(this.agent_pos)
            //Synchronizes the center position of a character model with its actual position in world space.
        this.shapes.human.center_x[0] = this.agent_pos[0]
        this.shapes.human.center_x[1] = this.agent_pos[1]
        this.shapes.human.center_x[2] = this.agent_pos[2]
        this.shapes.human.update_bound()

        this.shapes.human.draw(context, program_state, this.agent_trans)


            
            
// human collision
        

        //human collision check
        if (this.boundings.some(check) || this.shapes.human.bound.intersects (this.shapes.ball.bound) || 
        this.shapes.human.bound.intersects (this.still_items[0].bound)) {
            this.collision = true
            
            
        }
        else if (this.shapes.human.bound.intersects (this.still_items[1].bound)) {
            this.moving = false
            this.collision = false

            if (this.face == "left") {
                this.lr = true
                this.face = "forward"
                this.agent_rot[0] -= Math.PI/2
                let intervalId = setInterval(() => {
                    
                    this.shapes.human.swingLeg(program_state.animation_time/300)

                    this.agent_pos[2] += 2*this.dt
                }, 0);
                
              
                setTimeout(() => {
                  
                    this.lr = false
                    this.stop_human_figure()
                    clearInterval(intervalId);
                }, 500);
            }
            if (this.face == "right") {
                this.face = "backward"
                this.lr = true
                this.agent_rot[0] -= Math.PI/2
                let intervalId = setInterval(() => {
                    
                    this.shapes.human.swingLeg(program_state.animation_time/300)

                    this.agent_pos[2] -= 2*this.dt
                }, 0);
                
          
                setTimeout(() => {
             
                    this.stop_human_figure()
                    this.lr = false
                    clearInterval(intervalId);
                }, 500);
            }
            if (!this.lr) {
                this.collision = true
                let intervalId = setInterval(() => {
                    if (this.face == "backward")
                    this.agent_pos[2] -= 1*this.dt
                    else if (this.face == "forward")
                    this.agent_pos[2] += 1*this.dt
                    this.shapes.human.swingLeg(program_state.animation_time/300)


                }, 0);

                setTimeout(() => {
                    this.chicken_human = false
                    this.stop_human_figure()
                    clearInterval(intervalId);
                }, 100);

            }
          

            }
        
        else {
            this.collision = false
        }


// ball collision check
        if (this.boundings.some(check2)|| 
        this.shapes.ball.bound.intersects (this.still_items[0].bound) || this.shapes.ball.bound.intersects (this.still_items[1].bound)&&this.kick) {

            this.ball_collision = true
            if (!this.double_collide) {
                let j = 0
                for (let i of this.boundings) {
                    if (i.intersects(this.shapes.ball.bound)) {
                        this.current_collide = j
                    }
                    j++
                }
                if (this.shapes.ball.bound.intersects (this.still_items[1].bound)) {this.current_collide = 10}
    
            }
                /* if (this.shapes.ball.bound.intersects(this.still_items[1].bound && !this.kick)) {
                    console.log(1)
                    this.ball_pos[0] = (this.chicken_direction === true) ? this.ball_pos[0] + .1 : this.ball_pos[0] - .1
                } */
            //console.log("oddd")
            //this.kick=false
        } else {



            if(!this.kick)//&& this.boundings.some(check2) == false)
            this.ball_collision = false
        }




// Draw ball  
        
        if(this.time == 0)
            this.within_range = this.within_the_range()
        if(this.kick && this.within_range)
            this.kicking_ball(this.shapes.ball)
        if(!this.within_range)
            this.kick = false
        //console.log("kick" + this.within_range)
        // Drawing ball
        let ball_model_transform = Mat4.translation(this.ball_pos[0], this.ball_pos[1], this.ball_pos[2])
        //console.log(this.ball_pos)
                                                    
        this.shapes.ball.center_x[0] = this.ball_pos[0]
        this.shapes.ball.center_x[1] = this.ball_pos[1]
        this.shapes.ball.center_x[2] = this.ball_pos[2]
        this.shapes.ball.update_bound()
        this.shapes.ball.draw(context, program_state, ball_model_transform)
        
        
        

//移动鸡，到距离转方向转面

 

        this.temp -= this.move_chicken(this.shapes.chicken)
        if (this.temp <= 0) {
            this.chicken_direction = !this.chicken_direction
            this.direction = - this.direction
            this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0))
            this.temp = this.length
        }


//check out and goal
        this.check_goal()
        // only check the bound when not getting
        if(!this.get_goal)
            this.check_out_of_bound()
        
        //视角转换， this.first == true: 第一人称
        if(this.first) {this.set_camera_init(program_state)}
        else if (!this.second && !this.third&&!this.initial) {
            //console.log(this.agent_trans)
            setTimeout(() => this.set_camera_init(program_state), 2000);
        

        }

      
        else if (this.second) {
            program_state.camera_inverse = Mat4.rotation(Math.PI/2, 0, 1, 0).times(Mat4.rotation(Math.PI/12, 0, 0, 1)).times(Mat4.translation(45, -12, 0))

        }
        else if (this.third) {
            program_state.camera_inverse = Mat4.rotation(-Math.PI/2, 0, 1, 0).times(Mat4.rotation(-Math.PI/12, 0, 0, 1)).times(Mat4.translation(-45, -12, 0))
        }

        else if (this.initial) {program_state.set_camera(this.initial_camera_location)}
        //else {program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)))}

//画障碍物
        let num = 1
        for (let i = 0; i < this.still_items.length; i++) {
            if (i < 2) {
            this.still_items[i].draw(context, program_state, Mat4.identity(), this.materials.phong)
            }
            else {
                this.still_items[i].draw(context, program_state, Mat4.translation(this.boundings[i-2].x, this.boundings[i-2].y, this.boundings[i-2].z), this.materials.phong)
                }
          
        }  
//just for decoration, feel free to delete

        for (let i of this.flower_trans) {
            this.shapes.flower.draw(context, program_state, i, this.materials.phong)
        }
        this.shapes.tree.draw(context, program_state, Mat4.translation(15,5,-35))
        this.shapes.tree.draw(context, program_state, Mat4.translation(-15,5,-35))

     

    } 
}